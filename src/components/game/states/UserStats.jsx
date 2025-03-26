import { useSocketContext } from "@/context/socket"
import Button from "@/components/Button"

export default function UserStats({ data: { user, questions, totalQuestions } }) {
  const { socket } = useSocketContext()

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-2">
      <h2 className="mb-6 text-5xl font-bold text-white drop-shadow-md">
        {user.username}
      </h2>
      <div className="mb-4 flex items-center justify-center gap-4">
        <div className="rounded bg-primary px-4 py-2 text-2xl font-bold text-white">
          {`${user.correctAnswers || 0}/${totalQuestions}`}
        </div>
        <div className="rounded bg-black/40 px-4 py-2 text-xl font-bold text-white">
          {`${user.points} очков`}
        </div>
      </div>
      
      <div className="flex w-full flex-col gap-3 max-h-[60vh] overflow-y-auto">
        <h3 className="text-center text-2xl font-bold text-white mb-2">Ответы на вопросы</h3>
        {user.answers && questions && questions.map((question, index) => {
          const answer = user.answers[index];
          if (!answer) return null;
          
          return (
            <div
              key={index}
              className={`flex flex-col w-full rounded-md ${answer.isCorrect ? 'bg-green-600' : 'bg-red-600'} p-4 text-white`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold">{`Вопрос ${index + 1}`}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{answer.isCorrect ? "Правильно" : "Неправильно"}</span>
                  {answer.isCorrect && <span className="text-sm bg-black/30 px-2 py-1 rounded">{`+${answer.points} очков`}</span>}
                </div>
              </div>
              <p className="text-sm mb-2">{question.question}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {question.answers.map((answerText, ansIdx) => (
                  <div 
                    key={ansIdx} 
                    className={`p-2 rounded text-sm ${
                      answer.answer === ansIdx 
                        ? (answer.isCorrect ? 'bg-green-500' : 'bg-red-500') 
                        : question.solution === ansIdx 
                          ? 'bg-green-500/50' 
                          : 'bg-black/20'
                    } ${
                      (answer.answer === ansIdx || question.solution === ansIdx) ? 'font-bold' : ''
                    }`}
                  >
                    {ansIdx === question.solution && '✓ '}
                    {answer.answer === ansIdx && answer.answer !== question.solution && '✗ '}
                    {answerText}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {(!user.answers || user.answers.length === 0) && (
          <div className="text-center text-white text-xl">
            Нет данных об ответах
          </div>
        )}
      </div>
      
      <div className="mt-6 relative z-50">
        <Button 
          className="bg-primary text-white relative z-50" 
          onClick={() => {
            console.log("Нажата кнопка 'Назад к таблице лидеров'");
            socket.emit("manager:showFullLeaderboard");
          }}
        >
          Назад к таблице лидеров
        </Button>
      </div>
    </section>
  )
} 