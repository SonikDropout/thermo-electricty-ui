
set -e

# MAIN APP INSTALLATION
npm i
npm run build

echo '~/thermo-electricity-ui/dist/linux-armv7l-unpacked/thermo-electricity-ui' > ~/.xinitrc
chmod +x ~/.xinitrc

reboot
