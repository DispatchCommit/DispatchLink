import React, { useEffect, useMemo, useState } from 'react';
import { ipcRenderer } from 'electron';
import { GameState, AmongUsState, Player } from '../common/AmongUsState';
import Avatar from './Avatar';
import { ISettings } from '../common/ISettings';

interface OtherTalking {
	[playerId: number]: boolean;
}

interface OtherDead {
	[playerId: number]: boolean;
}

interface SocketIdMap {
	[socketId: string]: number;
}

export default function Overlay() {
	const [status, setStatus] = useState("WAITING");
	const [gameState, setGameState] = useState<AmongUsState>({} as AmongUsState);
	const [settings, setSettings] = useState<ISettings>({} as ISettings);
	const [socketPlayerIds, setSocketPlayerIds] = useState<SocketIdMap>({});
	const [talking, setTalking] = useState(false);
	const [otherTalking, setOtherTalking] = useState<OtherTalking>({});
	const [otherDead, setOtherDead] = useState<OtherDead>({});
	const myPlayer = useMemo(() => {
			if (!gameState || !gameState.players) return undefined;
			else return gameState.players.find(p => p.isLocal);
		}, [gameState]);

	const relevantPlayers = useMemo(() => {
		let relevantPlayers: Player[];
		if (!gameState || !gameState.players || gameState.lobbyCode === 'MENU' || !myPlayer) relevantPlayers = [];
		else relevantPlayers = gameState.players.filter(p => (
				(Object.values(socketPlayerIds).includes(p.id) || p.isLocal) &&
				((!myPlayer.isDead && !otherDead[p.id]) || myPlayer.isDead)
			));
		return relevantPlayers;
	}, [gameState]);

	let talkingPlayers: Player[];
	if (!gameState || !gameState.players || gameState.lobbyCode === 'MENU' || !myPlayer) talkingPlayers = [];
	// else talkingPlayers = gameState.players.filter(p => (otherTalking[p.id] || (p.isLocal && talking)));
	else talkingPlayers = gameState.players;

	useEffect(() => {
		if (gameState.gameState === GameState.LOBBY) {
			setOtherDead({});
		} else if (gameState.gameState !== GameState.TASKS) {
			if (!gameState.players) return;
			setOtherDead(old => {
				for (let player of gameState.players) {
					old[player.id] = player.isDead || player.disconnected;
				}
				return { ...old };
			});
		}
	}, [gameState.gameState]);

	useEffect(() => {
		const onOverlaySettings = (_: Electron.IpcRendererEvent, newSettings: any) => {
			setSettings(newSettings);
		};

		const onOverlayState = (_: Electron.IpcRendererEvent, state: string) => {
			setStatus(state);
		};

		const onOverlayGameState = (_: Electron.IpcRendererEvent, newState: AmongUsState) => {
			setGameState(newState);
		};

		const onOverlaySocketIds = (_: Electron.IpcRendererEvent, ids: SocketIdMap) => {
			setSocketPlayerIds(ids);
		};

		const onOverlaySocketClients = (_: Electron.IpcRendererEvent, socketClients: any) => {
		  // Convert Client Mapping to Socket Mapping
      const socketIds: SocketIdMap = {};
      for (let s of Object.keys(socketClients)) {
        socketIds[s] = socketClients.playerId;
      }

      // Set variable
      setSocketPlayerIds(socketClients);
		};

		const onOverlayTalkingSelf = (_: Electron.IpcRendererEvent, talking: boolean) => {
		  console.log( `Overlay Set Talking (self):`, talking );
			setTalking(talking);
		};

		const onOverlayTalking = (_: Electron.IpcRendererEvent, id: number) => {
      console.log( `Overlay Set Talking (other):`, id );
			setOtherTalking(old => ({
				...old,
				[id]: true
			}));
		};

		const onOverlayNotTalking = (_: Electron.IpcRendererEvent, id: number) => {
      console.log( `Overlay Set NOT Talking (other):`, id );
			setOtherTalking(old => ({
				...old,
				[id]: false
			}));

		};

		ipcRenderer.on('overlaySettings', onOverlaySettings);
		ipcRenderer.on('overlayState', onOverlayState);
		ipcRenderer.on('overlayGameState', onOverlayGameState);
		ipcRenderer.on('overlaySocketIds', onOverlaySocketIds);
		ipcRenderer.on('overlaySocketClients', onOverlaySocketClients);
		ipcRenderer.on('overlayTalkingSelf', onOverlayTalkingSelf);
		ipcRenderer.on('overlayTalking', onOverlayTalking);
		ipcRenderer.on('overlayNotTalking', onOverlayNotTalking);

		return () => {
			ipcRenderer.off('overlaySettings', onOverlaySettings);
			ipcRenderer.off('overlayState', onOverlayState);
			ipcRenderer.off('overlayGameState', onOverlayGameState);
			ipcRenderer.off('overlaySocketIds', onOverlaySocketIds);
			ipcRenderer.off('overlaySocketClients', onOverlaySocketClients);
			ipcRenderer.off('overlayTalkingSelf', onOverlayTalkingSelf);
			ipcRenderer.off('overlayTalking', onOverlayTalking);
			ipcRenderer.off('overlayNotTalking', onOverlayNotTalking);
		}
	}, []);

	document.body.style.backgroundColor = "rgba(255, 255, 255, 0)";
	document.body.style.paddingTop = "0";

	const baseCSS:any = {
		backgroundColor: "rgba(0, 0, 0, 0.85)",
		width: "150px",
		borderRadius: "8px",
		position: "relative",
		marginTop: "-16px",
		paddingLeft: "8px",
	};
	let topArea = <div><div><b style={{color:"#ff9800"}}>DispatchLink</b></div><div><i style={{fontSize:".75rem", fontWeight:"lighter"}}>proximity mod</i></div><div>[{status}]</div></div>
	const playersCSS:any = {}
	let playerList:Player[] = [];
	if (gameState.players && gameState.gameState != GameState.MENU) playerList = relevantPlayers;

	if (gameState.gameState == GameState.UNKNOWN || gameState.gameState == GameState.MENU) {
		baseCSS["left"] = "8px";
		baseCSS["top"] = "60px";
	} else {
		baseCSS["paddingTop"] = "8px";
		baseCSS["paddingLeft"] = "0px";
		baseCSS["width"] = "800px";
		baseCSS["backgroundColor"] = "rgba(0, 0, 0, 0.5)";
		if (settings.overlayPosition == 'top') {
			baseCSS["marginLeft"] = "auto";
			baseCSS["marginRight"] = "auto";
			baseCSS["marginTop"] = "0px";
		} else if (settings.overlayPosition == 'bottom_left') {
			baseCSS["position"] = "absolute";
			baseCSS["bottom"] = "0px";
			baseCSS["backgroundColor"] = "rgba(0, 0, 0, 0.35)";
			baseCSS["width"] = null;

			playersCSS["justifyContent"] = "left"
			playersCSS["alignItems"] = "left"
		}
		topArea = <></>;
		if ((settings.compactOverlay || gameState.gameState == GameState.TASKS) && playerList) {
			playerList = talkingPlayers;
			baseCSS["backgroundColor"] = "rgba(0, 0, 0, 0)";
		}
	}

	let playerArea:JSX.Element = <></>;
  if (playerList) {
    playerArea = <div className="otherplayers" style={playersCSS}>
      {
        playerList.map(player => {
          const connected = Object.values(socketPlayerIds).includes(player.id) || player.isLocal;
          let name = settings.compactOverlay ? "" : <span><small>{player.name}</small></span>
          return (
            <div key={player.id} style={{width:"60px", textAlign:"center"}}>
              <div style={{paddingLeft:"5px"}}>
                {player.id}
                <Avatar
                  key={player.id}
                  player={player}
                  talking={!connected || otherTalking[player.id] || (player.isLocal && talking)}
                  borderColor={connected ? '#2ecc71' : '#c0392b'}
                  isAlive={(!player.isLocal && !otherDead[player.id]) || (player.isLocal && !player.isDead)}
                  size={50}
                />
              </div>
              {name}
            </div>
          );
        })
      }
    </div>
  }
  

	return (
	<div style={baseCSS}>
		{topArea}
		{playerArea}
	</div>
	)
}
