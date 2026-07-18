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
- `launcher.service` - legacy systemd service reference; `install.sh` disables it and uses desktop autostart for Chromium reliability.
- `launcher.sh` - boot launcher that checks USB drives, starts the web server, and opens Chromium.
- `~/.config/autostart/takt-builder.desktop` - desktop-session launcher created by `install.sh`.
- `update.sh` - replaces the installed game with a supplied `dist` folder.
- `README.md` - this guide.

## One-Time Pi Install

Copy this `raspberry-pi` folder to the Pi, then run:

```sh
cd raspberry-pi
bash install.sh
sudo reboot
```

`install.sh` only installs or updates the launcher files. It does not intentionally start kiosk mode immediately; the reboot starts the arcade launcher cleanly.

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
- Legacy service file: `/etc/systemd/system/launcher.service`, disabled by `install.sh`
- Desktop launcher: `/home/admin/.config/autostart/takt-builder.desktop`

## Persistence

Game updates replace only `/home/admin/TaktBuilder`, which contains the static Vite build.

Launcher script updates are separate from game updates. If this `raspberry-pi` folder changes, run `install.sh` on the cabinet once to copy the updated launcher scripts into `/home/admin/TaktBuilderLauncher`.

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

If the USB drive also contains a `raspberry-pi` folder next to `dist`, the launcher copies updated `launcher.sh` and `update.sh` into `/home/admin/TaktBuilderLauncher` for the next boot. This is optional and intended for future launcher fixes; normal game updates only need `dist`.

## Runtime Behavior

On every boot, the launcher:

1. The Pi desktop autostart runs the launcher from the logged-in graphical session.
2. The launcher opens Chromium quickly to a local Takt Builder startup screen.
3. Looks for a USB `dist` update while that startup screen is visible.
4. If found, updates the startup screen with progress while `update.sh` replaces `/home/admin/TaktBuilder`.
5. Shows `Update Complete` and tells the operator they can remove the USB drive.
6. Starts the installed game at `http://localhost:8080`.
7. Lets the startup screen automatically hand off to the game once the local game server is ready.

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

If the Pi boots to a white screen or the desktop instead of the game, check the launcher logs with:

```sh
cat /home/admin/TaktBuilderData/logs/launcher.log
cat /home/admin/TaktBuilderData/logs/chromium.log
```

The installer disables the older system service path. To confirm it is disabled:

```sh
systemctl is-enabled launcher.service
systemctl is-active launcher.service
```

Both commands should report `disabled` or `inactive` after installation.

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
