# Takt Builder Raspberry Pi Deployment

This folder contains the one-time installer and boot launcher for a Raspberry Pi arcade cabinet.

After `install.sh` is run once on a fresh Pi, normal updates do not require terminal access:

1. Run `npm run build` on your development machine.
2. Copy the generated `dist` folder to a USB drive.
3. Insert the USB drive into the Pi.
4. Reboot the Pi.
5. The Pi installs the USB build and launches the game automatically.

## Files

- `install.sh` - run once on a fresh Pi.
- `launcher.service` - systemd service that starts the arcade launcher on boot.
- `launcher.sh` - boot launcher that checks USB drives, starts the web server, and opens Chromium.
- `update.sh` - replaces the installed game with a supplied `dist` folder.
- `README.md` - this guide.

## One-Time Pi Install

Copy this `raspberry-pi` folder to the Pi, then run:

```sh
cd raspberry-pi
bash install.sh
sudo reboot
```

The default Pi user is `admin`. To install for a different user:

```sh
PI_USER=pi bash install.sh
```

If you change `PI_USER`, also update the `User`, `Group`, `HOME`, `XAUTHORITY`, `WorkingDirectory`, and `ExecStart` paths in `launcher.service` before installing.

## Installed Locations

- Game files: `/home/admin/TaktBuilder`
- Launcher scripts: `/home/admin/TaktBuilderLauncher`
- Chromium profile: `/home/admin/TaktBuilderProfile`
- Data/log folder: `/home/admin/TaktBuilderData`
- Service file: `/etc/systemd/system/launcher.service`

## Persistence

Game updates replace only `/home/admin/TaktBuilder`, which contains the static Vite build.

Controller mappings, high scores, and settings are preserved because Chromium is launched with a stable profile:

```txt
/home/admin/TaktBuilderProfile
```

Browser local storage is stored there, outside the game folder. Remote game updates or USB `dist` updates should not erase it.

Do not wipe `/home/admin/TaktBuilderProfile` unless you intentionally want to reset cabinet-local mappings, scores, and settings.

## USB Update Detection

On boot, `launcher.sh` waits briefly for mounted USB drives and searches these locations for a folder named `dist` containing `index.html`:

- `/media/admin`
- `/media/pi`
- `/media/$PI_USER`
- `/run/media/$PI_USER`
- `/mnt`

The first valid `dist` folder found is installed.

## Runtime Behavior

On every boot, the launcher:

1. Looks for a USB `dist` update.
2. If found, opens a simple update screen with a progress bar.
3. Runs `update.sh` to replace `/home/admin/TaktBuilder`.
4. Shows `Update Complete` and tells the operator they can remove the USB drive.
5. Starts the installed game at `http://localhost:8080`.
6. Opens Chromium in kiosk mode at that local URL.

If no USB update is found, it launches the currently installed game.

During an update, leave the USB drive inserted until the screen says:

```txt
The game update is complete. You can remove the USB drive now.
```

## Logs

Logs are written to:

```txt
/home/admin/TaktBuilderData/logs
```

Useful files:

- `launcher.log`
- `update.log`
- `server.log`
- `server-status.log`
- `chromium.log`

## Development Update Workflow

From this repo on your development machine:

```sh
npm run build
```

Then copy the entire `dist` folder to the root of a USB drive. The USB should look like:

```txt
USB_DRIVE/
  dist/
    index.html
    assets/
    ...
```

Insert the USB drive into the Pi and reboot.
