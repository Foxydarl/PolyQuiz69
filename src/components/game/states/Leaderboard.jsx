import { useEffect, useState } from "react"
import { useSocketContext } from "@/context/socket"
import Button from "@/components/Button"

export default function Leaderboard({ data: { leaderboard, totalQuestions } }) {
  const { socket } = useSocketContext()
  const [cooldown, setCooldown] = useState(3)
  const [autoSkipTimer, setAutoSkipTimer] = useState(null)
  const [isAutoSkipEnabled, setIsAutoSkipEnabled] = useState(true)

  useEffect(() => {
    if (isAutoSkipEnabled) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            socket.emit("manager:nextQuestion")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setAutoSkipTimer(timer)
    }

    return () => {
      if (autoSkipTimer) {
        clearInterval(autoSkipTimer)
      }
    }
  }, [isAutoSkipEnabled, socket])

  const handleCancelAutoSkip = () => {
    setIsAutoSkipEnabled(false)
    if (autoSkipTimer) {
      clearInterval(autoSkipTimer)
      setAutoSkipTimer(null)
    }
  }

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-2">
      <h2 className="mb-6 text-5xl font-bold text-white drop-shadow-md">
        Leaderboard
      </h2>
      <div className="flex w-full flex-col gap-2">
        {leaderboard.map(({ username, points, correctAnswers = 0 }, key) => (
          <div
            key={key}
            className="flex w-full justify-between rounded-md bg-primary p-3 text-2xl font-bold text-white"
          >
            <span className="drop-shadow-md">{username}</span>
            <div className="flex gap-4">
              <span className="drop-shadow-md">{`${correctAnswers}/${totalQuestions}`}</span>
              <span className="text-sm text-gray-200 self-center">{`(${points} очков)`}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 right-4 flex items-center gap-4">
        {isAutoSkipEnabled && (
          <div className="bg-black/50 px-4 py-2 rounded-lg text-white text-xl">
            Автопропуск через {cooldown}
          </div>
        )}
        <Button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={handleCancelAutoSkip}
        >
          Отмена
        </Button>
      </div>
    </section>
  )
}
