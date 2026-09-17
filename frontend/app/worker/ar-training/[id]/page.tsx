'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { workerApi } from '@/lib/api';
import { ArrowLeft, CheckCircle2, XCircle, Play, Globe, Check, AlertCircle } from 'lucide-react';
import Script from 'next/script';
import { IOGP_SCENARIOS, RuleData, QuestionData, OptionData } from '../data';

export default function ARModuleScene() {
  const params = useParams();
  const router = useRouter();
  const ruleId = parseInt(params.id as string) || 9; // Default to 9
  const rule: RuleData = IOGP_SCENARIOS[ruleId] || IOGP_SCENARIOS[9];

  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stepResults, setStepResults] = useState<{ step_number: number, passed: boolean, points: number }[]>([]);
  const [moduleState, setModuleState] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [submitting, setSubmitting] = useState(false);
  
  const [feedbackState, setFeedbackState] = useState<{ status: 'correct' | 'incorrect' | 'showing_correct' | null, selectedIndex: number | null, correctIndex: number | null }>({ status: null, selectedIndex: null, correctIndex: null });
  const [locked, setLocked] = useState(false);
  
  const [lang, setLang] = useState<'en' | 'mr'>('en');
  const [audioError, setAudioError] = useState<string | null>(null);

  const totalPoints = stepResults.reduce((acc, curr) => acc + curr.points, 0);
  const maxPossiblePoints = rule.questions.length * 10;
  const currentQuestion = rule.questions[currentQuestionIndex];

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // If A-Frame is already loaded globally from a previous navigation, set it true immediately
    if (typeof window !== 'undefined' && (window as any).AFRAME) {
      setAframeLoaded(true);
    }
    
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      synthRef.current.getVoices();
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (moduleState === 'playing' && feedbackState.status === null) {
      playAudio(lang === 'en' ? currentQuestion.question_en : currentQuestion.question_mr);
    }
  }, [currentQuestionIndex, lang, moduleState, feedbackState.status]);

  const playAudio = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    let selectedVoice = null;
    
    if (lang === 'mr') {
      selectedVoice = voices.find(v => v.lang.includes('mr') || v.lang.includes('hi'));
      if (!selectedVoice) {
        setAudioError('Marathi voice not found. Falling back to captions.');
        return; 
      }
    } else {
      selectedVoice = voices.find(v => v.lang.includes('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      setAudioError(null);
    }
    
    synthRef.current.speak(utterance);
  };

  const handleOptionClick = (optionIndex: number, option: OptionData) => {
    if (locked) return;
    setLocked(true);
    
    const isCorrect = option.isCorrect;
    const points = isCorrect ? 10 : 0;
    const newResults = [...stepResults, { step_number: currentQuestionIndex + 1, passed: isCorrect, points }];
    setStepResults(newResults);
    
    setFeedbackState({ status: isCorrect ? 'correct' : 'incorrect', selectedIndex: optionIndex, correctIndex: null });
    playAudio(lang === 'en' ? option.feedback_en : option.feedback_mr);

    // Sequence the feedback timing
    setTimeout(() => {
      if (!isCorrect) {
        // Find the correct option index to highlight it
        const correctIdx = currentQuestion.options.findIndex(o => o.isCorrect);
        setFeedbackState(prev => ({ ...prev, status: 'showing_correct', correctIndex: correctIdx }));
        
        setTimeout(() => {
          advanceQuestion(newResults);
        }, 2000);
      } else {
        advanceQuestion(newResults);
      }
    }, 4000); // 4 seconds for audio to play and user to read feedback
  };

  const advanceQuestion = (results: any[]) => {
    setFeedbackState({ status: null, selectedIndex: null, correctIndex: null });
    setLocked(false);
    
    if (currentQuestionIndex < rule.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setModuleState('completed');
      submitFinalResults(results);
    }
  };

  const submitFinalResults = async (results: any[]) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const finalPoints = results.reduce((acc, curr) => acc + curr.points, 0);
      await workerApi.arTraining.submitResult(ruleId, finalPoints, 1, results);
    } catch (err) {
      console.error('Failed to submit result:', err);
    }
  };

  const startModule = () => {
    if (synthRef.current) synthRef.current.resume();
    setModuleState('playing');
  };

  return (
    <div className="h-[85vh] w-full flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-950">
      <Script src="https://aframe.io/releases/1.4.2/aframe.min.js" onLoad={() => setAframeLoaded(true)} strategy="beforeInteractive" />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-slate-900/90 to-transparent flex justify-between pointer-events-none text-white">
        <div className="flex items-center space-x-4 pointer-events-auto">
          <button onClick={() => router.push('/worker/ar-training')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors bg-slate-900/50 backdrop-blur border border-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-slate-900/60 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
            <h2 className="font-bold text-lg">{rule.title}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-3 pointer-events-auto">
          <button onClick={() => setLang(l => l === 'en' ? 'mr' : 'en')} className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-slate-600">
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? 'English' : 'मराठी'}</span>
          </button>
          <div className="bg-slate-900/60 backdrop-blur px-4 py-2 rounded-lg text-right border border-slate-700">
            <div className="text-sm font-bold text-indigo-400 font-mono">Safety Score: {totalPoints}/{maxPossiblePoints}</div>
          </div>
        </div>
      </div>

      {/* States: Idle, Completed */}
      {moduleState === 'idle' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm pointer-events-auto">
          <div className="text-center p-8 max-w-md w-full">
            <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6"><Play className="w-10 h-10 text-indigo-500 ml-2" /></div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Begin</h2>
            <p className="text-slate-300 mb-8">This module features audio narration and interactive choices.</p>
            <button onClick={startModule} disabled={!aframeLoaded} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg flex justify-center items-center">
              {!aframeLoaded ? 'Loading Engine...' : 'Start Module'}
            </button>
          </div>
        </div>
      )}

      {moduleState === 'completed' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm pointer-events-auto p-4">
          <div className="max-w-xl w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Training Completed ✓</h2>
            <div className="text-2xl font-mono text-indigo-400 mb-6 bg-slate-900/50 py-3 rounded-xl border border-slate-700/50">Score: {totalPoints}/{maxPossiblePoints}</div>
            
            <div className="bg-slate-700/30 rounded-xl p-5 mb-8 border border-slate-600/50 text-left">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center"><Check className="w-4 h-4 mr-2" /> What you learned</h3>
              <p className="text-white text-lg font-medium leading-relaxed">
                {lang === 'en' ? rule.learning_objective_en : rule.learning_objective_mr}
              </p>
            </div>
            
            <button onClick={() => router.push('/worker/ar-training')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg transition-colors">
              Return to Training List
            </button>
          </div>
        </div>
      )}

      {/* Play State - Floating 3D HUD UI */}
      {moduleState === 'playing' && (
        <div className="absolute inset-0 z-20 pointer-events-none p-4 pb-12 md:p-8 flex flex-col items-center justify-end" style={{ perspective: '1200px' }}>
          
          {/* Injecting a keyframe animation for the floating HUD effect */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes hudFloat {
              0% { transform: translateY(0px) rotateX(15deg); }
              50% { transform: translateY(-12px) rotateX(12deg); }
              100% { transform: translateY(0px) rotateX(15deg); }
            }
            .hud-panel {
              animation: hudFloat 6s ease-in-out infinite;
              transform-origin: bottom center;
            }
          `}} />

          <div className="w-full max-w-3xl pointer-events-auto flex flex-col items-center hud-panel">
            
            {/* Feedback Banner - Floating Glass Pill */}
            {feedbackState.status && (
              <div className={`px-8 py-4 rounded-2xl font-bold flex items-center mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl border ${
                feedbackState.status === 'correct' ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50' : 
                'bg-red-500/30 text-red-300 border-red-500/50'
              }`}>
                {feedbackState.status === 'correct' ? <CheckCircle2 className="w-6 h-6 mr-3 drop-shadow-md" /> : <XCircle className="w-6 h-6 mr-3 drop-shadow-md" />}
                <span className="text-xl drop-shadow-md">{feedbackState.status === 'correct' ? '✓ Correct Action' : '✗ Unsafe Action'}</span>
                <span className="ml-6 text-base text-white/90 font-medium drop-shadow-md border-l border-white/20 pl-6">
                  {lang === 'en' 
                    ? currentQuestion.options[feedbackState.selectedIndex!].feedback_en 
                    : currentQuestion.options[feedbackState.selectedIndex!].feedback_mr}
                </span>
              </div>
            )}

            {/* Question Area */}
            <div className="w-full text-center mb-8">
              {audioError && <div className="text-xs text-amber-400 mb-2 font-medium flex items-center justify-center"><AlertCircle className="w-4 h-4 mr-1"/> {audioError}</div>}
              
              <h3 className="text-white text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] px-4">
                {lang === 'en' ? currentQuestion.question_en : currentQuestion.question_mr}
              </h3>
            </div>

            {/* Options Grid - Floating Glass Cards */}
            <div className="grid grid-cols-1 gap-4 w-full">
              {currentQuestion.options.map((option, idx) => {
                
                // Styling logic based on feedback state
                let btnStyle = "bg-slate-900/40 hover:bg-slate-800/60 border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.5)]";
                let icon = null;

                if (feedbackState.status) {
                  if (idx === feedbackState.selectedIndex) {
                    if (option.isCorrect) {
                      btnStyle = "bg-emerald-600/40 border-emerald-400/80 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500";
                      icon = <CheckCircle2 className="w-6 h-6 text-emerald-400 ml-auto drop-shadow-md" />;
                    } else {
                      btnStyle = "bg-red-600/40 border-red-400/80 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.4)]";
                      icon = <XCircle className="w-6 h-6 text-red-400 ml-auto drop-shadow-md" />;
                    }
                  } else if (feedbackState.status === 'showing_correct' && option.isCorrect) {
                    btnStyle = "bg-emerald-600/40 border-emerald-400/80 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500 animate-pulse";
                    icon = <CheckCircle2 className="w-6 h-6 text-emerald-400 ml-auto drop-shadow-md" />;
                  } else {
                    btnStyle = "bg-slate-950/60 border-white/5 text-white/40 opacity-40 blur-[1px]";
                  }
                }

                return (
                  <button 
                    key={idx}
                    disabled={locked}
                    onClick={() => handleOptionClick(idx, option)}
                    className={`text-left px-6 py-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 flex items-center text-xl font-semibold transform ${locked ? 'cursor-default scale-100' : 'cursor-pointer hover:-translate-y-2 hover:scale-[1.02]'} ${btnStyle}`}
                  >
                    <span className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center mr-5 text-lg font-bold text-white/70 shadow-inner border border-white/10">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="drop-shadow-md">{lang === 'en' ? option.text_en : option.text_mr}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* A-Frame Background Scene (Static Backdrop Only) */}
      <div className="flex-1 relative w-full h-full pointer-events-none">
        {aframeLoaded && (moduleState === 'playing' || moduleState === 'idle') ? (
          // @ts-ignore
          <a-scene embedded className="w-full h-full" renderer="antialias: true; colorManagement: true;">
            <a-assets>
              {/* Photo-realistic Sky - Place HDRI or .jpg in public/assets/textures/ */}
              <img id="sky-texture" src="/assets/textures/sky.jpg" alt="Sky" />
            </a-assets>

            <a-sky src="#sky-texture" color="#38bdf8"></a-sky> 
            <a-light type="ambient" color="#ffffff" intensity="0.6"></a-light>
            <a-light type="directional" color="#ffffff" intensity="1.2" position="2 4 2" castShadow="true"></a-light>
            
            {/* Ground Plane (Hidden for Rule 9 to show height) */}
            {ruleId !== 9 && (
              <a-circle position="0 0 0" rotation="-90 0 0" radius="50" color="#64748b" roughness="0.8"></a-circle>
            )}

            {/* Camera with subtle sway (raised and angled down to clear the bottom UI card) */}
            <a-entity position="0 2.2 2" animation="property: rotation; from: -10 -4 0; to: -10 4 0; dir: alternate; dur: 6000; loop: true; easing: easeInOutSine">
              <a-entity animation="property: position; from: -0.1 0 0; to: 0.1 0 0; dir: alternate; dur: 4500; loop: true; easing: easeInOutSine">
                <a-entity camera look-controls="enabled: false"></a-entity>
              </a-entity>
            </a-entity>

            {/* -----------------------------
                MODULE SPECIFIC ENVIRONMENTS 
                ----------------------------- */}
            
            {ruleId === 1 && (
              <a-entity position="0 0 -4">
                <a-box color="#334155" width="2" height="2" depth="1.5" position="0 1 0"></a-box>
                <a-box color="#475569" width="1" height="1" depth="1.6" position="-0.8 1 0"></a-box>
                <a-box color="#ef4444" width="0.2" height="0.5" depth="0.5" position="0.5 1.2 0.75" material="emissive: #ef4444; emissiveIntensity: 0.5"></a-box>
              </a-entity>
            )}

            {ruleId === 2 && (
              <a-entity position="0 0 -5">
                <a-cylinder color="#1e293b" radius="2" height="4" position="0 2 0"></a-cylinder>
                {/* Circular opening (dark hole) */}
                <a-cylinder color="#000000" radius="0.4" height="0.1" rotation="90 0 0" position="0 0.5 1.95"></a-cylinder>
              </a-entity>
            )}

            {ruleId === 3 && (
              <a-entity position="0 0 -4">
                <a-plane color="#334155" width="4" height="15" rotation="-90 0 0" position="0 0.01 0"></a-plane>
                <a-box color="#f59e0b" width="1.8" height="0.6" depth="4" position="0 0.5 0"></a-box>
                <a-box color="#fbbf24" width="1.6" height="0.6" depth="1.5" position="0 1.1 -0.5"></a-box>
                <a-box color="#1e293b" width="1.7" height="0.5" depth="1.4" position="0 1.1 -0.5"></a-box>
              </a-entity>
            )}

            {ruleId === 4 && (
              <a-entity position="0 0 -4">
                <a-box color="#475569" width="1" height="1" depth="1" position="-1 0.5 0"></a-box>
                <a-cylinder color="#94a3b8" radius="0.1" height="2" rotation="0 0 90" position="0 0.5 0"></a-cylinder>
                <a-box color="#64748b" width="0.5" height="1.5" depth="0.5" position="1 0.75 0"></a-box>
                <a-box color="#ef4444" width="0.1" height="0.2" depth="0.51" position="1 1 0"></a-box>
              </a-entity>
            )}

            {ruleId === 5 && (
              <a-entity position="0 0 -3">
                <a-box color="#334155" width="2" height="1" depth="1" position="0 0.5 0"></a-box>
                <a-sphere color="#fbbf24" radius="0.2" position="0 1.2 0" material="emissive: #f59e0b; emissiveIntensity: 1; transparent: true; opacity: 0.8" animation="property: scale; to: 1.2 1.2 1.2; dir: alternate; loop: true; dur: 200"></a-sphere>
                <a-sphere color="#ef4444" radius="0.1" position="0 1.2 0" material="emissive: #ef4444; emissiveIntensity: 1"></a-sphere>
              </a-entity>
            )}

            {ruleId === 6 && (
              <a-entity position="0 0 -4">
                <a-cylinder color="#1e293b" radius="0.02" height="5" position="0 3.5 0"></a-cylinder>
                <a-box color="#f59e0b" width="1.5" height="1" depth="1.5" position="0 1.5 0" animation="property: rotation; to: 0 10 0; dir: alternate; loop: true; dur: 3000; easing: easeInOutSine"></a-box>
              </a-entity>
            )}

            {ruleId === 7 && (
              <a-entity position="0 0 -5">
                <a-ring color="#ef4444" radius-inner="2.4" radius-outer="2.5" rotation="-90 0 0" position="0 0.02 0"></a-ring>
                <a-cylinder color="#1e293b" radius="0.03" height="4" position="0 3.5 0"></a-cylinder>
                <a-box color="#475569" width="1.2" height="1.2" depth="1.2" position="0 1 0" animation="property: position; to: 0 1.2 0; dir: alternate; loop: true; dur: 2000; easing: easeInOutSine"></a-box>
              </a-entity>
            )}

            {ruleId === 8 && (
              <a-entity position="0 0 -3">
                <a-cylinder color="#ef4444" radius="0.05" height="1" position="-1.5 0.5 0"></a-cylinder>
                <a-cylinder color="#ef4444" radius="0.05" height="1" position="1.5 0.5 0"></a-cylinder>
                <a-cylinder color="#ef4444" radius="0.05" height="3" rotation="0 0 90" position="0 0.8 0"></a-cylinder>
                <a-box color="#f8fafc" width="0.6" height="0.8" depth="0.05" position="2 1 0"></a-box>
                <a-plane color="#94a3b8" width="0.4" height="0.05" position="2 1.2 0.03"></a-plane>
                <a-plane color="#94a3b8" width="0.3" height="0.05" position="1.95 1.1 0.03"></a-plane>
                <a-plane color="#ef4444" width="0.4" height="0.1" position="2 0.8 0.03"></a-plane>
              </a-entity>
            )}

            {ruleId === 9 && (
              <a-entity position="0 0 0">
                <a-box color="#475569" width="4" height="0.5" depth="4" position="0 -0.25 0"></a-box>
                <a-box color="#334155" width="2" height="30" depth="2" position="0 -15.5 0"></a-box>
                <a-plane color="#1e293b" width="100" height="100" rotation="-90 0 0" position="0 -30 0"></a-plane>
                <a-cylinder color="#f59e0b" radius="0.05" height="4" rotation="0 0 90" position="0 1 -2"></a-cylinder>
                <a-cylinder color="#f59e0b" radius="0.05" height="1" position="-2 0.5 -2"></a-cylinder>
                <a-cylinder color="#f59e0b" radius="0.05" height="1" position="2 0.5 -2"></a-cylinder>
              </a-entity>
            )}

            {ruleId === 10 && (
              <a-entity position="0 0 -4">
                <a-cylinder color="#475569" radius="0.3" height="1.5" position="0 0.75 0"></a-cylinder>
                <a-cylinder color="#1e293b" radius="0.4" height="0.2" position="0 1.5 0"></a-cylinder>
                <a-cylinder color="#64748b" radius="0.1" height="0.8" rotation="90 0 0" position="0 1 0.4"></a-cylinder>
                <a-cylinder color="#ef4444" radius="0.2" height="0.05" rotation="90 0 0" position="0 1 0.8"></a-cylinder>
                <a-sphere color="#d1d5db" radius="0.8" position="0 1.8 0" material="transparent: true; opacity: 0.6" animation="property: scale; to: 1.2 1.2 1.2; dir: alternate; loop: true; dur: 2000"></a-sphere>
                <a-sphere color="#e2e8f0" radius="0.5" position="-0.5 1.5 0.5" material="transparent: true; opacity: 0.4" animation="property: scale; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 2500"></a-sphere>
              </a-entity>
            )}

          </a-scene>
        ) : null}
      </div>
    </div>
  );
}
