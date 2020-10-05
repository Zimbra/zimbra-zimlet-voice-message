import { createElement, Component } from 'preact';
import { withIntl } from '../../enhancers';
import style from './style';
import { ModalDialog, ActionMenuItem, NakedButton } from '@zimbra-client/components';
import { withText } from 'preact-i18n';

@withIntl()
@withText({
    title: 'voice-message-zimlet.title',
    description: 'voice-message-zimlet.description',
    startBtn: 'voice-message-zimlet.startBtn',
    stopBtn: 'voice-message-zimlet.stopBtn',
    attachmentName: 'voice-message-zimlet.attachmentName',
    mailSubject: 'voice-message-zimlet.mailSubject'
})

export default class MoreMenu extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;
        this.props.onAttachmentOptionSelection(this.chooseLinksFromService);
    }

    //onAttachmentOptionSelection is passed from the Zimlet Slot and allows to add an event handler
    onAttachFilesFromService = () =>
        this.props.onAttachmentOptionSelection(this.chooseFilesFromService);

    chooseFilesFromService = (editor) => {
        this.showDialog(editor);
    }

    alert = (message) => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.notifications.notify({
            message: message
        }));
    }

    showDialog = (editor) => {

        const { title } = this.props;
        this.modal = (
            <ModalDialog
                class={style.modalDialog}
                contentClass={style.modalContent}
                innerClass={style.inner}
                onClose={this.handleClose}
                cancelButton={false}
                header={false}
                footer={false}
            >
                <div class="zimbra-client_modal-dialog_inner"><header class="zimbra-client_modal-dialog_header"><h2>{title}</h2><button onClick={this.handleClose} aria-label="Close" class="zimbra-client_close-button_close zimbra-client_modal-dialog_actionButton"><span role="img" class="zimbra-icon zimbra-icon-close blocks_icon_md"></span></button></header>
                    <div class="zimbra-client_modal-dialog_content zimbra-client_language-modal_languageModalContent">
                        {this.props.description}
                    </div>
                    <footer class="zimbra-client_modal-dialog_footer" id="nextcloudDialogButtons">
                        <button type="button" onClick={e => this.handleClick(e, editor)} id="voice-message-startBtn" class="blocks_button blocks_button_regular">{this.props.startBtn}</button>
                        <button type="button" onClick={e => this.handleClickStop(e, editor)} id="voice-message-stopBtn" style="visibility:hidden" class="blocks_button blocks_button_regular">{this.props.stopBtn}</button>
                    </footer>
                </div>
            </ModalDialog>
        );

        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal', modal: this.modal }));
    }

    handleClose = e => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));
    }

    // https://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/
    handleClick = (e, editor) => {
        let _this = this;
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            // store streaming data chunks in array
            const chunks = [];
            // create media recorder instance to initialize recording
            this.recorder = new MediaRecorder(stream);
            // function to be called when data is received
            this.recorder.ondataavailable = e => {
                // add stream data to chunks
                chunks.push(e.data);
                // if recorder is 'inactive' then recording has finished
                if (this.recorder.state == 'inactive') {
                    // convert stream data chunks to a 'webm' audio format as a blob
                    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                        const blob = new Blob(chunks, { type: 'audio/webm' });
                        let file = new window.parent.File([blob], (_this.props.attachmentName + " " + Date.now() + ".webm"), { type: 'audio/webm' });
                        editor.addAttachments([file]);
                    }
                    else { _this.alert("Unsupported browser") }
                    console.log(editor);
                    if (editor.getSubject().length < 1) {
                        editor.setSubject(_this.props.mailSubject);
                    }
                    _this.handleClose();
                }
            };

            this.recorder.start();
            parent.document.getElementById('voice-message-stopBtn').style.visibility = "visible";
            parent.document.getElementById('voice-message-startBtn').style.visibility = "hidden";
        });
    }

    handleClickStop = (e, editor) => {
        this.recorder.stop();
    }

    render() {
        return (<ActionMenuItem onClick={this.onAttachFilesFromService} >
            { this.props.title}
        </ActionMenuItem>
        );
    }
}
