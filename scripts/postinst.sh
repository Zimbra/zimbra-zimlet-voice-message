#!/bin/bash
echo "*** Configuring Zimbra-Zimlet-Voice-Message ***"
echo "*** Checking if Zimbra-Zimlet-Voice-Message  zimlet is installed. ***"
su - zimbra -c "zmmailboxdctl status"
if [ $? -ne 0 ]; then
   echo "*** Mailbox is not running... ***"
   echo "*** Follow the steps below as zimbra user ignore if installing through install.sh .. ***"
   echo "*** Install the Zimbra-Zimlet-Voice-Message  zimlet. ***"
   echo "*** zmzimletctl deploy /opt/zimbra/zimlets-network/zimbra-zimlet-voice-message.zip ***"
   echo "*** zmprov fc zimlet ***"
else
   echo "*** Deploying Zimbra-Voice-Message  zimlet ***"
   su - zimbra -c  "zmzimletctl deploy /opt/zimbra/zimlets-network/zimbra-zimlet-voice-message.zip"
   su - zimbra -c  "zmprov fc zimlet"
fi
echo "*** Zimbra-Zimlet-Voice-Message  Installation Completed. ***"
echo "*** Restart the mailbox service as zimbra user. Run ***"
echo "*** su - zimbra ***"
echo "*** zmmailboxdctl restart ***"
