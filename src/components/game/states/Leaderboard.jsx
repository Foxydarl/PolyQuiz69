import { useSocketContext } from "@/context/socket"
import { useEffect, useRef, useState } from "react"
import Button from "@/components/Button"

export default function Leaderboard({ data: { leaderboard, totalQuestions, isFinal } }) {
  const { socket } = useSocketContext()
  const [autoSkipCountdown, setAutoSkipCountdown] = useState(3)
  const [isAutoSkipEnabled, setIsAutoSkipEnabled] = useState(true)
  const autoSkipTimerRef = useRef(null)

  useEffect(() => {
    // Автоскип только если это не финальная таблица
    if (!isFinal && isAutoSkipEnabled) {
      setAutoSkipCountdown(3)
      autoSkipTimerRef.current = setInterval(() => {
        setAutoSkipCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(autoSkipTimerRef.current)
            socket.emit("manager:nextQuestion")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (autoSkipTimerRef.current) {
        clearInterval(autoSkipTimerRef.current)
      }
    }
  }, [isAutoSkipEnabled, socket, isFinal])

  const handleCancelAutoSkip = () => {
    setIsAutoSkipEnabled(false)
    if (autoSkipTimerRef.current) {
      clearInterval(autoSkipTimerRef.current)
      autoSkipTimerRef.current = null
    }
  }

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-2">
      <h2 className="mb-6 text-5xl font-bold text-white drop-shadow-md">
        Таблица лидеров
      </h2>
      <div className="flex w-full flex-col gap-2 max-h-[70vh] overflow-y-auto mb-4">
        {leaderboard.map((user, key) => (
          <div
            key={key}
            className="flex w-full justify-between rounded-md bg-primary p-3 text-2xl font-bold text-white"
          >
            <span className="drop-shadow-md">{`${key + 1}. ${user.username}`}</span>
            <div className="flex gap-4">
              <span className="drop-shadow-md">{`${user.correctAnswers || 0}/${totalQuestions}`}</span>
              <span className="text-sm text-gray-200 self-center">{`(${user.points} очков)`}</span>
            </div>
          </div>
        ))}
      </div>

      {!isFinal && (
        <div className="fixed bottom-4 right-4 flex items-center gap-4">
          {isAutoSkipEnabled && (
            <div className="bg-black/50 px-4 py-2 rounded-lg text-white text-xl">
              Автопропуск через {autoSkipCountdown}
            </div>
          )}
          <Button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            onClick={handleCancelAutoSkip}
          >
            Отмена
          </Button>
        </div>
      )}
    </section>
  )
}
