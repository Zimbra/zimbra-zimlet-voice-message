#!/bin/bash

npm install
zimlet build
zimlet package -v 1.0.5 --zimbraXVersion ">=2.0.0" -n "zimbra-zimlet-voice-message" --desc "Use Voice Message Zimlet to record a message from Zimbra" -l "Voice Message Zimlet"
