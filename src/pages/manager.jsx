import Button from "@/components/Button"
import GameWrapper from "@/components/game/GameWrapper"
import ManagerPassword from "@/components/ManagerPassword"
import { GAME_STATES, GAME_STATE_COMPONENTS_MANAGER } from "@/constants"
import { usePlayerContext } from "@/context/player"
import { useSocketContext } from "@/context/socket"
import { useRouter } from "next/router"
import { createElement, useEffect, useState, useCallback } from "react"

export default function Manager() {
  const { socket } = useSocketContext()

  const [nextText, setNextText] = useState("Start")
  const [state, setState] = useState({
    ...GAME_STATES,
    status: {
      ...GAME_STATES.status,
      name: "SHOW_ROOM",
    },
  })

  // Оборачиваем в useCallback для предотвращения создания новой функции при каждом рендеринге
  const updateState = useCallback((newState) => {
    setState(prevState => ({
      ...prevState,
      ...newState,
      status: {
        ...(newState.status || prevState.status),
      },
      question: {
        ...(prevState.question || {}),
        ...(newState.question || {}),
      },
    }));
  }, []);

  useEffect(() => {
    const handleStatus = (status) => {
      console.log("Получено новое состояние:", status.name);
      updateState({
        status: status,
      });
    };

    const handleInviteCode = (inviteCode) => {
      updateState({
        created: true,
        status: {
          ...state.status,
          data: {
            ...(state.status.data || {}),
            inviteCode,
          },
        },
      });
    };

    socket.on("game:status", handleStatus);
    socket.on("manager:inviteCode", handleInviteCode);

    return () => {
      socket.off("game:status", handleStatus);
      socket.off("manager:inviteCode", handleInviteCode);
    };
  }, [socket, updateState, state.status]);

  const handleCreate = () => {
    socket.emit("manager:createRoom");
  }

  const handleSkip = useCallback(() => {
    setNextText("Skip");
    const currentName = state.status.name;
    
    console.log("Обработка кнопки для состояния:", currentName);

    switch (currentName) {
      case "SHOW_ROOM":
        socket.emit("manager:startGame");
        break;

      case "SELECT_ANSWER":
        socket.emit("manager:abortQuiz");
        break;

      case "SHOW_RESPONSES":
        socket.emit("manager:showLeaderboard");
        break;

      case "SHOW_LEADERBOARD":
        socket.emit("manager:nextQuestion");
        break;
        
      case "SHOW_FULL_LEADERBOARD":
        socket.emit("manager:showPodium");
        break;
        
      case "SHOW_USER_STATS":
        socket.emit("manager:showFullLeaderboard");
        break;
        
      case "FINISH":
        socket.emit("manager:showFullLeaderboard");
        break;
    }
  }, [state.status.name, socket]);

  const currentComponent = GAME_STATE_COMPONENTS_MANAGER[state.status.name];
  console.log("Текущее состояние компонента:", state.status.name);

  return (
    <>
      {!state.created ? (
        <div>
          <ManagerPassword onSubmit={handleCreate} />
        </div>
      ) : (
        <>
          <GameWrapper 
            textNext={state.status.name === "FINISH" ? "Показать таблицу лидеров" : nextText} 
            onNext={handleSkip} 
            manager
            gameEnded={state.status.name === "FINISH" || state.status.name === "SHOW_FULL_LEADERBOARD" || state.status.name === "SHOW_USER_STATS"}
          >
            {currentComponent &&
              createElement(currentComponent, {
                data: state.status.data || {},
              })}
          </GameWrapper>
        </>
      )}
    </>
  );
}
