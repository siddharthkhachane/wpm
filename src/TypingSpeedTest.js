import React, { useState, useEffect, useRef } from 'react';

// Sample texts for typing test
const sampleTexts = [
  "I love typing games because they help me improve my speed and accuracy while having fun at the same time.",
  "My favorite pizza has extra cheese, mushrooms and pepperoni on a thin and crispy crust, fresh from the oven.",
  "The weekend is finally here and I plan to watch movies, play video games and sleep in until noon.",
  "Sunshine after rain brings rainbows, and summer days are perfect for picnics in the park with friends.",
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
  
  // Start the test
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
    if (value.length >= currentText.length) {
      endTest();
    }
  };
  
  // Render colored text based on user input
  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = '';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-500' : 'text-red-500 bg-red-50';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 space-y-6 border-t-4 border-purple-500 transition-all duration-300">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Typing <span className="text-purple-600">Speed</span> Test</h1>
          <p className="text-gray-600">Test your typing speed and accuracy</p>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-purple-700">{timer}s</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl font-semibold text-purple-700">{wpm} WPM</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl font-semibold text-purple-700">{accuracy}% Accuracy</span>
          </div>
          
          <button
            onClick={resetTest}
            className="flex items-center py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition duration-200"
          >
            Reset
          </button>
        </div>
        
        {!isFinished ? (
          <>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-lg leading-relaxed font-mono shadow-inner">
              {renderText()}
            </div>
            
            <div>
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none resize-none font-mono text-lg shadow-sm"
                placeholder="Start typing here..."
                rows={4}
                disabled={isFinished}
              />
            </div>
            
            {!isActive && !userInput.length && (
              <div className="text-center">
                <button
                  onClick={startTest}
                  className="py-3 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Start Test
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Test Results</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-500 mb-1">Words Per Minute</p>
                <p className="text-3xl font-bold text-gray-800">{wpm}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-500 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-gray-800">{accuracy}%</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <p className="text-gray-500 mb-1">Correct Characters</p>
                <p className="text-3xl font-bold text-green-600">{correctChars}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <p className="text-gray-500 mb-1">Incorrect Characters</p>
                <p className="text-3xl font-bold text-red-600">{incorrectChars}</p>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={resetTest}
                className="py-3 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
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

export default TypingSpeedTest;
