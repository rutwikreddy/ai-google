import React, { useState } from 'react';
import { BrainCircuit, MessageSquareText, LayoutDashboard, RefreshCcw } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import { parseResume } from './services/geminiService';
import { ParsedResume } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Content = base64String.split(',')[1];
        
        setFileData({
          base64: base64Content,
          mimeType: file.type
        });

        try {
          const data = await parseResume(base64Content, file.type);
          setParsedData(data);
          setActiveTab('dashboard');
        } catch (err) {
            console.error(err);
            setError("Failed to parse the resume. Please ensure the file is readable and try again.");
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError("Error reading file.");
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setFileData(null);
    setActiveTab('dashboard');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                ResumeIQ
              </span>
            </div>
            
            {parsedData && (
              <div className="flex items-center space-x-4">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'dashboard' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'chat' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <MessageSquareText className="w-4 h-4 mr-2" />
                    Assistant
                  </button>
                </div>
                
                <button 
                  onClick={handleReset}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Upload New Resume"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                <span className="font-medium mr-2">Error:</span> {error}
            </div>
        )}

        {/* State: No Data (Upload) */}
        {!parsedData && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Unlock Candidate Potential with <span className="text-indigo-600">AI</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload a resume to instantly extract structured data, visualize skills, and chat with the candidate's profile using advanced RAG technology.
              </p>
            </div>
            
            <FileUpload onFileUpload={handleFileUpload} isLoading={loading} />
            
            {loading && (
                <div className="mt-8 text-center animate-pulse">
                    <p className="text-indigo-600 font-medium">Processing document with Gemini 2.5...</p>
                    <p className="text-slate-400 text-sm mt-1">Extracting entities, analyzing skills, and generating summary</p>
                </div>
            )}
          </div>
        )}

        {/* State: Has Data */}
        {parsedData && fileData && (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'dashboard' ? (
              <Dashboard data={parsedData} />
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Chat with {parsedData.personalInfo.name}'s Resume</h2>
                    <p className="text-slate-500">Ask specific questions about experience, gaps, or soft skills.</p>
                </div>
                <ChatInterface base64File={fileData.base64} mimeType={fileData.mimeType} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
