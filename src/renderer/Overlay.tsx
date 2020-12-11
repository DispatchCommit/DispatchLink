import React, { useEffect, useMemo, useState, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { AmongUsState, GameState, Player } from '../main/GameReader';
import Avatar from './Avatar';
//import { SettingsContext } from "./App";

interface OtherTalking {
	[playerId: number]: boolean;
}

interface OtherDead {
	[playerId: number]: boolean;
}

export default function Overlay() {
	const [status, setStatus] = useState("WAITING");
	const [gameState, setGameState] = useState<AmongUsState>({} as AmongUsState);
	const [talking, setTalking] = useState(false);
	const [otherTalking, setOtherTalking] = useState<OtherTalking>({});
	const myPlayer = useMemo(() => {
			if (!gameState || !gameState.players) return undefined;
			else return gameState.players.find(p => p.isLocal);
		}, [gameState]);
	//const [settings] = useContext(SettingsContext);
	
	/*const otherPlayers = useMemo(() => {
		let otherPlayers: Player[];
		if (!gameState || !gameState.players || gameState.lobbyCode === 'MENU' || !myPlayer) otherPlayers = [];
		else otherPlayers = gameState.players.filter(p => !p.isLocal);

		return otherPlayers;
	}, [gameState]);*/
	
	const talkingPlayers = useMemo(() => {
		let talkingPlayers: Player[];
		if (!gameState || !gameState.players || gameState.lobbyCode === 'MENU' || !myPlayer) talkingPlayers = [];
		else talkingPlayers = gameState.players.filter(p => (otherTalking[p.id] || (p.isLocal && talking)));
		return talkingPlayers;
	}, [gameState]);
	
	const [otherDead, setOtherDead] = useState<OtherDead>({});

	const relevantPlayers = useMemo(() => {
		let relevantPlayers: Player[];
		if (!gameState || !gameState.players || gameState.lobbyCode === 'MENU' || !myPlayer) relevantPlayers = [];
		else relevantPlayers = gameState.players.filter(p => ((!myPlayer.isDead && !otherDead[p.id]) || myPlayer.isDead));
		return relevantPlayers;
	}, [gameState]);
	
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
		const onOverlayState = (_: Electron.IpcRendererEvent, state: string) => {
			setStatus(state);
		};
		
		const onOverlayGameState = (_: Electron.IpcRendererEvent, newState: AmongUsState) => {
			setGameState(newState);
		};
		
		const onOverlayTalkingSelf = (_: Electron.IpcRendererEvent, talking: boolean) => {
			setTalking(talking);
		};
		
		const onOverlayTalking = (_: Electron.IpcRendererEvent, id: number) => {
			setOtherTalking(old => ({
				...old,
				[id]: true
			}));		
		};
		
		const onOverlayNotTalking = (_: Electron.IpcRendererEvent, id: number) => {
			setOtherTalking(old => ({
				...old,
				[id]: false
			}));
			
		};

		ipcRenderer.on('overlayState', onOverlayState);
		ipcRenderer.on('overlayGameState', onOverlayGameState);
		ipcRenderer.on('overlayTalkingSelf', onOverlayTalkingSelf);
		ipcRenderer.on('overlayTalking', onOverlayTalking);
		ipcRenderer.on('overlayNotTalking', onOverlayNotTalking);
		return () => {
			ipcRenderer.off('overlayState', onOverlayState);
			ipcRenderer.off('overlayGameState', onOverlayGameState);
			ipcRenderer.off('overlayTalkingSelf', onOverlayTalkingSelf);
			ipcRenderer.off('overlayTalking', onOverlayTalking);
			ipcRenderer.off('overlayNotTalking', onOverlayNotTalking);
		}
	}, []);
	
	// TODO: access settings and read settings.compactOverlay
	var compact = false;
	
	var extra:JSX.Element = <></>;
	if (gameState.gameState == GameState.LOBBY) {
		extra = <p>"State is Lobby."</p>		
	}
	
	if (myPlayer != undefined) {
		extra = <></>;

	}

	document.body.style.backgroundColor = "rgba(255, 255, 255, 0)";
	document.body.style.paddingTop = "0";
	var baseCSS:any = {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
	  width: "100px",
	  borderRadius: "8px",
	  position: "relative",
	  marginTop: "-16px",
	  paddingLeft: "8px",
    };
	var topArea = <p><b style={{color:"#9b59b6"}}>CrewLink</b> ({status})</p>
	var playerList:Player[] = [];
	if (gameState.players && gameState.gameState != GameState.MENU) playerList = relevantPlayers;//gameState.players;
	
	if (gameState.gameState == GameState.UNKNOWN || gameState.gameState == GameState.MENU) {
		baseCSS["left"] = "8px";
		baseCSS["top"] = "60px";
	} else {
		baseCSS["marginLeft"] = "auto";
		baseCSS["marginRight"] = "auto";
		baseCSS["marginTop"] = "0px";
		baseCSS["paddingTop"] = "8px";
		baseCSS["paddingLeft"] = "0px";
		baseCSS["width"] = "800px";
		baseCSS["backgroundColor"] = "rgba(0, 0, 0, 0.5)"; //0.25
		topArea = <></>;
		if ((compact || gameState.gameState == GameState.TASKS) && playerList) {
			playerList = talkingPlayers;
			baseCSS["backgroundColor"] = "rgba(0, 0, 0, 0)";
		}
	}

	var playerArea:JSX.Element = <></>;
	if (playerList) {
			playerArea = <div className="otherplayers">
				{
							playerList.map(player => {
								let connected = true;
								let name = compact ? "" : <span><small>{player.name}</small></span>
								return (
									<div style={{width:"60px", textAlign:"center"}}>
										<div style={{paddingLeft:"5px"}}>
											<Avatar key={player.id} player={player}
												talking={!connected || otherTalking[player.id] || (player.isLocal && talking)}
												borderColor={connected ? '#2ecc71' : '#c0392b'}
												isAlive={!otherDead[player.id]}
												size={50} />
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
		{extra}
		<div className="otherplayers-left">
		{playerArea}
		</div>
	</div>
	)
}