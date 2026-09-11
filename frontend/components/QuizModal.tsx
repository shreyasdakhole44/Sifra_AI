'use client';

import React, { useState } from 'react';
import { quizApi } from '@/lib/api';
import { CheckCircle2, XCircle, Award, ArrowRight, X } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizModalProps {
  reportId: string;
  quizTitle: string;
  questions: Question[];
  onClose: () => void;
  onCompleted?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  reportId,
  quizTitle,
  questions,
  onClose,
  onCompleted
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIndex];

  const handleSelect = (optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optionIdx });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    let calculatedScore = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct_index) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);

    try {
      await quizApi.submit(reportId, quizTitle, calculatedScore, questions.length);
      if (onCompleted) onCompleted();
    } catch (e) {
      console.error('Error submitting quiz score:', e);
    } finally {
      setLoading(false);
    }
  };

  const percentage = Math.round((score / Math.max(1, questions.length)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-sm border border-slate-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-teal-700" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Safety Assessment Quiz</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{quizTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!submitted ? (
          <div>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-700 transition-all duration-200"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 leading-snug">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-colors flex items-start space-x-2.5 ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 ${
                        isSelected ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 disabled:opacity-30 hover:text-slate-800"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentIndex] === undefined}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < questions.length || loading}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                >
                  <span>{loading ? 'Submitting...' : 'Submit Assessment'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Result Summary Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-2xl">
              {percentage}%
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                {percentage >= 70 ? 'Safety Qualification Passed' : 'Refresher Training Required'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Scored {score} out of {questions.length} questions correctly.
              </p>
            </div>

            <div className="text-left space-y-2 max-h-48 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const userAns = selectedAnswers[i];
                const isCorrect = userAns === q.correct_index;
                return (
                  <div key={i} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="flex items-start justify-between font-medium text-slate-800">
                      <span>Q{i + 1}. {q.question}</span>
                      {isCorrect ? (
                        <span className="text-emerald-700 flex items-center space-x-1 shrink-0 ml-2 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center space-x-1 shrink-0 ml-2 text-[11px] font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-1 text-[11px]">
                      <span className="font-semibold text-slate-700">Explanation:</span> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-teal-700 text-white font-semibold rounded-lg text-xs hover:bg-teal-800 transition-colors"
            >
              Close Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
