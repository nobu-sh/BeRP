# Bedrock Edition Realm Protocol (BeRP)
BeRP is a raknet implementation solution for bedrock edition realms.

Join our [discord](https://discord.gg/9S4aKh684W) for updates!

We also have a [websocket](https://github.com/PMK744/Node-BEWSS) version that uses the /connect command in game!

BeRP works on Bedrock realms, and some external servers. External Servers (that use device auth)/singleplayer worlds are not supported and is not planned to be.

BeRP uses protocol data from another repository. For more info, visit [here](https://github.com/NobUwU/BeRP/tree/main/data/latest).

## Instaltion

1. Download Source
  A. Clone the repo
    ```sh
      git clone https://github.com/NobUwU/BeRP.git
    ```
  B. Download as zip
   Code > Download ZIP
   Extract ZIP once your ZIP is downloaded.

2. Dependencies
- [Node.JS](https://nodejs.org/en/download/)
- [GIT](https://git-scm.com/downloads)

3. Building
 - Windows
   - Run `win_build.bat`
   - Run `win_start.bat`
 - Linux
   - Run `linux_build.bat`
   - Run `linux_start.bat`

## Authentication
 1. Adding Accounts
- To add an account simply run `acc add`
2. Removing Accounts
- To remove an account from BeRP run `acc remove`

## Disclaimer
BeRP doesn't work on Repl.it, we don't know why our current _**theory**_ is that Repl.it blocks connections to the auth servers.
