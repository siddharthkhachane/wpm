import React, { useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, Award } from 'lucide-react';

// Sample texts for typing test
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages.",
  "A good programmer is someone who always looks both ways before crossing a one-way street. Debugging is twice as hard as writing the code in the first place.",
  "The best way to predict the future is to invent it. Computer science education cannot make anybody an expert programmer any more than studying brushes and pigment can make somebody an expert painter.",
];

function App() {
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
  
  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Initialize with a random text
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
  }, []);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(intervalRef.current);
      endTest();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timer]);
  
  // Calculate WPM in real-time
  useEffect(() => {
    if (isActive && startTime) {
      const timeElapsed = (Date.now() - startTime) / 60000; // in minutes
      const wordsTyped = userInput.trim().split(/\s+/).length;
      if (timeElapsed > 0) {
        const currentWpm = Math.round(wordsTyped / timeElapsed);
        setWpm(isNaN(currentWpm) ? 0 : currentWpm);
      }
    }
  }, [isActive, startTime, userInput]);
  
  // Start the test - fixed to safely check for inputRef.current
  const startTest = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setUserInput('');
    // Add a small delay to ensure the ref is available
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
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
    return currentText.split('').map((char, index) => {
      let className = '';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-500' : 'text-red-500 bg-red-100';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Typing Speed Test</h1>
          <p className="text-gray-600">Test your typing speed and accuracy</p>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-xl font-semibold">{timer}s</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl font-semibold">{wpm} WPM</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl font-semibold">{accuracy}% Accuracy</span>
          </div>
          
          <button
            onClick={resetTest}
            className="flex items-center py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>
        
        {!isFinished ? (
          <>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-lg leading-relaxed font-mono">
              {renderText()}
            </div>
            
            <div>
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-lg"
                placeholder="Start typing here..."
                rows={4}
                disabled={isFinished}
              />
            </div>
            
            {!isActive && !userInput.length && (
              <div className="text-center">
                <button
                  onClick={startTest}
                  className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
                >
                  Start Test
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center mb-6">
              <Award className="w-12 h-12 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Test Results</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 mb-1">Words Per Minute</p>
                <p className="text-3xl font-bold text-gray-800">{wpm}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-gray-800">{accuracy}%</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 mb-1">Correct Characters</p>
                <p className="text-3xl font-bold text-green-600">{correctChars}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 mb-1">Incorrect Characters</p>
                <p className="text-3xl font-bold text-red-600">{incorrectChars}</p>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={resetTest}
                className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;