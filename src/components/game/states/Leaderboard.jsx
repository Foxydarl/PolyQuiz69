export default function Leaderboard({ data: { leaderboard, totalQuestions } }) {
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
    </section>
  )
}
