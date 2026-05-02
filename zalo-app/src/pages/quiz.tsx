import React, { useState, useEffect } from "react";
import { Page, Box, Text, Icon, Button, Spinner, Progress, useNavigate, useLocation } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";
import { taskService } from "@/services/api";

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, addCoins, addGrowth, t } = useGameStore();

  const taskId = location.state?.taskId ?? 1;
  const taskTitle = location.state?.taskTitle ?? "Trắc nghiệm";
  const taskReward = location.state?.taskReward ?? 40;
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<"idle" | "correct" | "wrong" | "finished">("idle");
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    // If it's a single quiz from task list
    if (location.state?.quiz_options) {
        setQuestions([{
            id: taskId,
            quiz_options: location.state.quiz_options,
            quiz_answer: location.state.quiz_answer,
            quiz_explanation: location.state.quiz_explanation,
            description: location.state.taskDesc
        }]);
        setLoading(false);
    } else {
        // Load bundle from API
        try {
            const res: any = await taskService.getQuizQuestions();
            setQuestions(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
  };

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion?.quiz_options 
    ? (typeof currentQuestion.quiz_options === "string" ? JSON.parse(currentQuestion.quiz_options) : currentQuestion.quiz_options)
    : [];

  const handleSelect = (opt: string) => {
    if (quizState !== "idle") return;
    const key = opt.substring(0, 1); // Get A, B, C or D
    setSelected(key);
  };

  const handleConfirm = async () => {
    if (!selected || quizState !== "idle") return;
    const isCorrect = selected === currentQuestion.quiz_answer;
    
    if (isCorrect) {
        setQuizState("correct");
        setCorrectCount(prev => prev + 1);
    } else {
        setQuizState("wrong");
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelected(null);
        setQuizState("idle");
    } else {
        // Finish
        try {
            await taskService.submitTask(userId, taskId, "quiz-complete");
            await addCoins(taskReward, 20);
            addGrowth(20);
            setQuizState("finished");
        } catch (err) {
            console.error(err);
            navigate(-1);
        }
    }
  };

  if (loading) return <Box className="flex justify-center items-center h-screen"><Spinner /></Box>;

  if (quizState === "finished") {
    return (
        <Page className="bg-white flex flex-col items-center justify-center p-6">
            <Box className="bg-green-100 p-8 rounded-full mb-6 text-green-700">
                <Icon icon="zi-star-solid" size={80} />
            </Box>
            <Text className="text-2xl font-black text-gray-800 text-center">Hoàn thành xuất sắc!</Text>
            <Text className="text-gray-500 text-center mt-2">Bạn đã trả lời đúng {correctCount}/{questions.length} câu hỏi.</Text>
            <Box className="bg-orange-100 text-orange-800 px-6 py-2 rounded-full font-black mt-4">+{taskReward} ⭐</Box>
            <Button fullWidth className="bg-green-800 mt-12 h-14 rounded-2xl font-bold" onClick={() => navigate(-1)}>Quay lại</Button>
        </Page>
    );
  }

  return (
    <Page className="bg-gray-50 pb-10">
      <Box className="bg-purple-800 pt-12 pb-6 px-4 text-white rounded-b-[32px] shadow-lg">
        <Box className="flex items-center space-x-2 opacity-70">
            <Icon icon="zi-notif-ring" size={16} />
            <Text className="text-xs font-bold uppercase tracking-wider">Trắc nghiệm kiến thức</Text>
        </Box>
        <Text className="text-xl font-black mt-1 leading-tight">{taskTitle}</Text>
        <Box className="mt-4 bg-white/20 h-1.5 rounded-full overflow-hidden">
            <Box className="bg-white h-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </Box>
        <Text className="text-right text-[10px] font-bold mt-1 opacity-70">Câu hỏi {currentIndex + 1}/{questions.length}</Text>
      </Box>

      <Box className="p-4 mt-4">
        <Box className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 min-h-[160px] flex items-center justify-center">
            <Text className="text-lg font-black text-gray-800 text-center leading-relaxed">
                {currentQuestion?.description || "Nội dung câu hỏi..."}
            </Text>
        </Box>

        <Box className="mt-6 space-y-3">
            {options.map((opt: string, i: number) => {
                const key = opt.substring(0, 1);
                const isSelected = selected === key;
                const isCorrect = quizState !== "idle" && key === currentQuestion.quiz_answer;
                const isWrong = quizState !== "idle" && isSelected && !isCorrect;

                let borderClass = "border-gray-200";
                let bgClass = "bg-white";
                let textClass = "text-gray-700";

                if (isSelected && quizState === "idle") { borderClass = "border-purple-600"; bgClass = "bg-purple-50"; textClass = "text-purple-800"; }
                if (isCorrect) { borderClass = "border-green-600"; bgClass = "bg-green-50"; textClass = "text-green-800"; }
                if (isWrong) { borderClass = "border-red-600"; bgClass = "bg-red-50"; textClass = "text-red-800"; }

                return (
                    <Box 
                        key={i} 
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all ${borderClass} ${bgClass}`}
                        onClick={() => handleSelect(opt)}
                    >
                        <Box className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs mr-4 ${isSelected || isCorrect ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {key}
                        </Box>
                        <Text className={`flex-1 font-bold text-sm ${textClass}`}>{opt}</Text>
                        {isCorrect && <Icon icon="zi-check-circle-solid" className="text-green-600" />}
                        {isWrong && <Icon icon="zi-close-circle-solid" className="text-red-600" />}
                    </Box>
                );
            })}
        </Box>

        {quizState !== "idle" && (
            <Box className={`mt-6 p-4 rounded-2xl border-l-4 ${quizState === 'correct' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
                <Text className="font-black text-xs uppercase mb-1">{quizState === 'correct' ? "Chính xác!" : "Sai rồi!"}</Text>
                <Text className="text-xs font-medium leading-relaxed">{currentQuestion.quiz_explanation || `Đáp án đúng là ${currentQuestion.quiz_answer}`}</Text>
            </Box>
        )}

        <Box className="mt-8">
            {quizState === 'idle' ? (
                <Button fullWidth disabled={!selected} className="bg-purple-800 h-14 rounded-2xl font-black shadow-lg" onClick={handleConfirm}>Xác nhận</Button>
            ) : (
                <Button fullWidth className="bg-green-800 h-14 rounded-2xl font-black shadow-lg" onClick={handleNext}>
                    {currentIndex < questions.length - 1 ? "Tiếp tục" : "Hoàn thành"}
                </Button>
            )}
        </Box>
      </Box>
    </Page>
  );
};

export default QuizPage;
