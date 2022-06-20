import { createElement, Component } from 'preact';
import { withIntl } from '../../enhancers';
import { ModalDialog, ActionMenuItem, NakedButton } from '@zimbra-client/components';
import { withText } from 'preact-i18n';

@withIntl()
@withText({
    title: 'voice-message-zimlet.title',
    description: 'voice-message-zimlet.description',
    startBtn: 'voice-message-zimlet.startBtn',
    stopBtn: 'voice-message-zimlet.stopBtn',
    attachmentName: 'voice-message-zimlet.attachmentName',
    mailSubject: 'voice-message-zimlet.mailSubject',
    noAudio: 'voice-message-zimlet.noAudio',
    errorNotSupported: 'voice-message-zimlet.errorNotSupported'
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
                onClose={this.handleClose}
                onAction={this.handleClose}
                title={this.props.title}
                cancelButton={false}

            >
                <p>{this.props.description}<button type="button" onClick={e => this.handleClick(e, editor)} id="voice-message-startBtn" class="blocks_button_button blocks_button_primary blocks_button_regular zimbra-client_sidebar-primary-button_button">{this.props.startBtn}</button>
                    <button type="button" onClick={e => this.handleClickStop(e, editor)} id="voice-message-stopBtn" style="visibility:hidden" class="blocks_button_button blocks_button_primary blocks_button_regular zimbra-client_sidebar-primary-button_button">{this.props.stopBtn}</button>
                </p></ModalDialog>
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
                    else { _this.alert(_this.props.errorNotSupported) }
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
        }).catch(function (err) {
            console.log(err);
            _this.alert(_this.props.noAudio);
        });
    }

    handleClickStop = (e, editor) => {
        this.recorder.stop();
    }

    render() {
        try {
            if (typeof (MediaRecorder) === "function") {
                return (<ActionMenuItem onClick={this.onAttachFilesFromService} >
                    {this.props.title}
                </ActionMenuItem>
                )
            };
        } catch (err) { return (<br style="display:none" />) }

    }
}
