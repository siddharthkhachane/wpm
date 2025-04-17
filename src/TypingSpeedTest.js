import React, { useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, Award, Keyboard, LineChart, Target } from 'lucide-react';

// Sample texts for typing test
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages.",
  "A good programmer is someone who always looks both ways before crossing a one-way street. Debugging is twice as hard as writing the code in the first place.",
  "The best way to predict the future is to invent it. Computer science education cannot make anybody an expert programmer any more than studying brushes and pigment can make somebody an expert painter.",
];

const TypingSpeedTest = () => {
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  
  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const wpmIntervalRef = useRef(null);
  
  // Initialize with a random text
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
  }, []);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(intervalRef.current);
      endTest();
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isActive, timer]);
  
  // WPM recording for chart
  useEffect(() => {
    if (isActive && startTime) {
      wpmIntervalRef.current = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 60000; // in minutes
        const wordsTyped = userInput.trim().split(/\s+/).length;
        const currentWpm = Math.round(wordsTyped / timeElapsed);
        const validWpm = isNaN(currentWpm) ? 0 : Math.min(currentWpm, 200); // Cap at reasonable max
        
        setWpm(validWpm);
        setWpmHistory(prev => [...prev, validWpm]);
      }, 2000); // Record every 2 seconds
    }
    
    return () => clearInterval(wpmIntervalRef.current);
  }, [isActive, startTime, userInput]);
  
  // Start the test
  const startTest = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setUserInput('');
    setWpmHistory([]);
    setShowIntro(false);
    inputRef.current.focus();
  };
  
  // End the test
  const endTest = () => {
    setIsActive(false);
    setIsFinished(true);
    calculateFinalStats();
  };
  
  // Reset the test
  const resetTest = () => {
    setIsActive(false);
    setIsFinished(false);
    setTimer(60);
    setUserInput('');
    setWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setIncorrectChars(0);
    setWpmHistory([]);
    setCursorPosition(0);
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
  };
  
  // Calculate final statistics
  const calculateFinalStats = () => {
    const totalChars = correctChars + incorrectChars;
    const accuracyValue = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    setAccuracy(accuracyValue);
  };
  
  // Handle user input
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!isActive && value.length > 0) {
      startTest();
    }
    
    setUserInput(value);
    setCursorPosition(value.length);
    
    // Calculate correct and incorrect characters
    let correct = 0;
    let incorrect = 0;
    
    for (let i = 0; i < value.length; i++) {
      if (i < currentText.length && value[i] === currentText[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }
    
    setCorrectChars(correct);
    setIncorrectChars(incorrect);
    
    // Check if text is completed
    if (value === currentText) {
      endTest();
    }
  };
  
  // Render colored text based on user input
  const renderText = () => {
    return (
      <div className="relative font-mono text-lg leading-relaxed rounded-lg p-2">
        {currentText.split('').map((char, index) => {
          let className = 'transition-colors duration-150';
          
          if (index < userInput.length) {
            className += userInput[index] === char 
              ? ' text-emerald-400' 
              : ' text-red-400 bg-red-900 bg-opacity-30';
          } else {
            className += ' text-gray-400';
          }
          
          // Add cursor effect
          if (index === cursorPosition) {
            className += ' border-r-2 border-cyan-400 animate-pulse';
          }
          
          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  // Simple WPM chart
  const renderWpmChart = () => {
    if (wpmHistory.length < 2) return null;

    const maxWpm = Math.max(...wpmHistory, 100);
    const height = 100;
    
    return (
      <div className="h-24 w-full flex items-end gap-1 mt-4">
        {wpmHistory.map((w, i) => {
          const barHeight = Math.max((w / maxWpm) * height, 4);
          return (
            <div 
              key={i} 
              className="bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t"
              style={{ 
                height: `${barHeight}%`, 
                width: `${100 / Math.max(20, wpmHistory.length)}%`,
                transition: 'height 0.3s ease-out' 
              }} 
              title={`${w} WPM`}
            />
          );
        })}
      </div>
    );
  };

  // Award badge based on WPM
  const getSpeedAward = () => {
    if (wpm < 30) return { name: "Beginner Typist", color: "text-gray-400" };
    if (wpm < 50) return { name: "Casual Typist", color: "text-green-400" };
    if (wpm < 70) return { name: "Efficient Typist", color: "text-blue-400" };
    if (wpm < 90) return { name: "Professional Typist", color: "text-purple-400" };
    return { name: "Speed Demon", color: "text-orange-400" };
  };

  // Intro screen with animation
  const renderIntroScreen = () => {
    return (
      <div className="text-center space-y-8 py-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="relative">
            <Keyboard className="w-20 h-20 text-cyan-400" />
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <span className="animate-ping absolute h-12 w-12 rounded-full bg-cyan-400 opacity-40"></span>
              <span className="absolute h-6 w-6 rounded-full bg-cyan-500"></span>
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">Typing Master</h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto">
            Test your typing speed and accuracy with this interactive typing challenge.
            How fast can your fingers fly?
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-6">
          <div className="grid grid-cols-3 gap-8 w-full max-w-lg">
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-gray-300">60-second challenge</span>
            </div>
            <div className="flex flex-col items-center">
              <LineChart className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-gray-300">Real-time WPM</span>
            </div>
            <div className="flex flex-col items-center">
              <Target className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-gray-300">Accuracy tracking</span>
            </div>
          </div>
          
          <button
            onClick={startTest}
            className="group relative px-8 py-4 overflow-hidden rounded-lg bg-cyan-600 text-lg font-bold text-white shadow-cyan-900/20 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <span className="absolute -top-10 left-0 right-0 h-40 w-full translate-y-0 transform bg-white opacity-10 transition-transform duration-1000 ease-out group-hover:translate-y-32"></span>
            Start Typing Test
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl shadow-cyan-900/20 p-6 space-y-6 border border-gray-700 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600 rounded-full opacity-10 blur-3xl"></div>
        
        {showIntro && !isActive && !isFinished ? (
          renderIntroScreen()
        ) : (
          <>
            <div className="text-center relative z-10">
              <h1 className="text-3xl font-bold text-white mb-1">Typing Speed Test</h1>
              <p className="text-gray-400">How fast can you type?</p>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-inner relative z-10">
              <div className="flex items-center px-4 py-2 bg-gray-900 rounded-lg">
                <Clock className="w-5 h-5 text-cyan-400 mr-2" />
                <span className={`text-2xl font-bold ${timer <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timer}s
                </span>
              </div>
              
              <div className="flex items-center px-4 py-2 bg-gray-900 rounded-lg">
                <span className="text-2xl font-bold text-cyan-400">{wpm}</span>
                <span className="ml-1 text-gray-400">WPM</span>
              </div>
              
              <div className="flex items-center px-4 py-2 bg-gray-900 rounded-lg">
                <span className={`text-2xl font-bold ${accuracy < 90 ? 'text-amber-400' : 'text-green-400'}`}>{accuracy}%</span>
                <span className="ml-1 text-gray-400">Accuracy</span>
              </div>
              
              <button
                onClick={resetTest}
                className="flex items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition duration-200 shadow"
              >
                <RotateCcw className="w-4 h-4 mr-1 text-cyan-400" />
                Reset
              </button>
            </div>
            
            {!isFinished ? (
              <>
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 shadow-inner text-lg leading-relaxed font-mono relative z-10">
                  {renderText()}
                </div>
                
                <div className="relative z-10">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-gray-700 outline-none resize-none font-mono text-gray-300 text-lg shadow-inner"
                    placeholder="Start typing here..."
                    rows={4}
                    disabled={isFinished}
                  />

                  {isActive && renderWpmChart()}
                </div>
                
                {!isActive && !userInput.length && !showIntro && (
                  <div className="text-center relative z-10">
                    <button
                      onClick={startTest}
                      className="py-3 px-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition duration-200 shadow-lg"
                    >
                      Start Test
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 bg-gray-900 rounded-lg border border-gray-700 shadow-xl relative z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg"></div>
                
                <div className="flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-cyan-500 rounded-full opacity-10 animate-ping"></div>
                  </div>
                  <Award className="w-16 h-16 text-yellow-400 mr-4" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">Test Results</h2>
                    <p className={`text-xl font-medium ${getSpeedAward().color}`}>{getSpeedAward().name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <p className="text-gray-400 mb-1 text-sm uppercase tracking-wider">Words Per Minute</p>
                    <p className="text-4xl font-bold text-cyan-400">{wpm}</p>
                    <div className="absolute bottom-2 right-2 opacity-10">
                      <LineChart className="w-12 h-12" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <p className="text-gray-400 mb-1 text-sm uppercase tracking-wider">Accuracy</p>
                    <p className={`text-4xl font-bold ${accuracy < 90 ? 'text-amber-400' : 'text-green-400'}`}>{accuracy}%</p>
                    <div className="absolute bottom-2 right-2 opacity-10">
                      <Target className="w-12 h-12" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <p className="text-gray-400 mb-1 text-sm uppercase tracking-wider">Correct Characters</p>
                    <p className="text-4xl font-bold text-green-400">{correctChars}</p>
                    <div className="h-2 w-full bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${correctChars / (correctChars + incorrectChars) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <p className="text-gray-400 mb-1 text-sm uppercase tracking-wider">Incorrect Characters</p>
                    <p className="text-4xl font-bold text-red-400">{incorrectChars}</p>
                    <div className="h-2 w-full bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${incorrectChars / (correctChars + incorrectChars) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {renderWpmChart()}
                
                <div className="text-center mt-8">
                  <button
                    onClick={resetTest}
                    className="group relative py-3 px-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-900/20"
                  >
                    <span className="absolute -top-10 left-0 right-0 h-40 w-full translate-y-0 transform bg-white opacity-10 transition-transform duration-1000 ease-out group-hover:translate-y-32"></span>
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* CSS Styles */}
        <style jsx>{`
          .text-gradient {
            background: linear-gradient(to right, #4ade80, #38bdf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TypingSpeedTest;