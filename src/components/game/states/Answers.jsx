import AnswerButton from "../../AnswerButton"
import { useSocketContext } from "@/context/socket"
import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import {
  ANSWERS_COLORS,
  ANSWERS_ICONS,
  SFX_ANSWERS_MUSIC,
  SFX_ANSWERS_SOUND,
  SFX_RESULTS_SOUND,
  SFX_POP_SOUND,
} from "@/constants"
import useSound from "use-sound"
import { usePlayerContext } from "@/context/player"
import Button from "@/components/Button"

const calculatePercentages = (objectResponses) => {
  const keys = Object.keys(objectResponses)
  const values = Object.values(objectResponses)

  if (!values.length) {
    return []
  }

  const totalSum = values.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  )

  let result = {}

  keys.map((key) => {
    result[key] = ((objectResponses[key] / totalSum) * 100).toFixed() + "%"
  })

  return result
}

export default function Answers({
  data: { question, answers, image, time, responses, correct },
}) {
  const { socket } = useSocketContext()
  const { player } = usePlayerContext()

  const [percentages, setPercentages] = useState([])
  const [cooldown, setCooldown] = useState(3)
  const [totalAnswer, setTotalAnswer] = useState(0)
  const [autoSkipTimer, setAutoSkipTimer] = useState(null)
  const [isAutoSkipEnabled, setIsAutoSkipEnabled] = useState(true)

  const [sfxPop] = useSound(SFX_POP_SOUND, { volume: 0.2 })

  const [sfxResults] = useSound(SFX_RESULTS_SOUND, {
    volume: 0.2,
  })

  const [playMusic, { stop: stopMusic, isPlaying }] = useSound(
    SFX_ANSWERS_MUSIC,
    {
      volume: 0.2,
    },
  )

  const handleAnswer = (answer) => {
    if (!player) {
      return
    }

    socket.emit("player:selectedAnswer", answer)
    sfxPop()
  }

  useEffect(() => {
    if (!responses) {
      playMusic()
      return
    }

    stopMusic()
    sfxResults()

    setPercentages(calculatePercentages(responses))
  }, [responses, playMusic, stopMusic])

  useEffect(() => {
    if (!isPlaying) {
      playMusic()
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      stopMusic()
    }
  }, [playMusic, stopMusic])

  useEffect(() => {
    socket.on("game:cooldown", (sec) => {
      setCooldown(sec)
    })

    socket.on("game:playerAnswer", (count) => {
      setTotalAnswer(count)
      sfxPop()
    })

    return () => {
      socket.off("game:cooldown")
      socket.off("game:playerAnswer")
    }
  }, [sfxPop])

  useEffect(() => {
    if (isAutoSkipEnabled && responses) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            socket.emit("manager:showLeaderboard")
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
  }, [isAutoSkipEnabled, socket, responses])

  const handleCancelAutoSkip = () => {
    setIsAutoSkipEnabled(false)
    if (autoSkipTimer) {
      clearInterval(autoSkipTimer)
      setAutoSkipTimer(null)
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>

        {!!image && !responses && (
          <img src={image} className="h-48 max-h-60 w-auto rounded-md" />
        )}

        {responses && (
          <div
            className={`grid w-full gap-4 grid-cols-${answers.length} mt-8 h-40 max-w-3xl px-2`}
          >
            {answers.map((_, key) => (
              <div
                key={key}
                className={clsx(
                  "flex flex-col justify-end self-end overflow-hidden rounded-md",
                  ANSWERS_COLORS[key],
                )}
                style={{ height: percentages[key] }}
              >
                <span className="w-full bg-black/10 text-center text-lg font-bold text-white drop-shadow-md">
                  {responses[key] || 0}
                </span>
              </div>
            ))}
          </div>
        )}

        {responses && (
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
        )}
      </div>

      <div>
        {!responses && (
          <div className="mx-auto mb-4 flex w-full max-w-7xl justify-between gap-1 px-2 text-lg font-bold text-white md:text-xl">
            <div className="flex flex-col items-center rounded-full bg-black/40 px-4 text-lg font-bold">
              <span className="translate-y-1 text-sm">Time</span>
              <span>{cooldown}</span>
            </div>
            <div className="flex flex-col items-center rounded-full bg-black/40 px-4 text-lg font-bold">
              <span className="translate-y-1 text-sm">Answers</span>
              <span>{totalAnswer}</span>
            </div>
          </div>
        )}

        <div className="mx-auto mb-4 grid w-full max-w-7xl grid-cols-2 gap-1 rounded-full px-2 text-lg font-bold text-white md:text-xl">
          {answers.map((answer, key) => (
            <AnswerButton
              key={key}
              className={clsx(ANSWERS_COLORS[key], {
                "opacity-65": responses && correct !== key,
              })}
              icon={ANSWERS_ICONS[key]}
              onClick={() => handleAnswer(key)}
            >
              {answer}
            </AnswerButton>
          ))}
        </div>
      </div>
    </div>
  )
}
