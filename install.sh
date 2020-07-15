# MAIN APP INSTALLATION
npm i &&
npm run build &&

sudo mkdir /usr/share/thermo-electricity
sudo cp -rf dist/linux-armv7l-unpacked/** /usr/share/thermo-electricity/
echo '/usr/share/thermo-electricity/thermo-electricity-ui' > ~/.xinitrc
chmod +x ~/.xinitrc