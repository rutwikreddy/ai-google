import React from 'react';
import { 
  User, Mail, Phone, MapPin, Linkedin, Briefcase, GraduationCap, 
  Award, TrendingUp, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { ParsedResume } from '../types';

interface DashboardProps {
  data: ParsedResume;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { personalInfo, skills, experience, education, overallScore, strengths, weaknesses } = data;

  // Transform skills for Radar Chart
  const radarData = skills.slice(0, 6).map(s => ({
    subject: s.name,
    A: s.level,
    fullMark: 100,
  }));

  // Categories for Bar Chart
  const skillCategories = skills.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(skillCategories).map(([name, count]) => ({
    name, count
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{personalInfo.name}</h1>
            <p className="text-slate-500 mt-1">{personalInfo.summary}</p>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {personalInfo.email}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {personalInfo.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {personalInfo.location}
              </div>
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-slate-400" />
                  <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">LinkedIn</a>
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${getScoreColor(overallScore)}`}>
            <span className="text-3xl font-bold">{overallScore}</span>
            <span className="text-xs font-medium uppercase tracking-wider">Match Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Skills Visualization */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Skill Proficiency
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Key Strengths
            </h3>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Potential Gaps
            </h3>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Experience & Education */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Experience */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Professional Experience
            </h3>
            
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="relative pl-8 border-l-2 border-slate-200 last:border-0 pb-1 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-600" />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h4 className="text-base font-bold text-slate-800">{exp.role}</h4>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{exp.duration}</span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 mb-2">{exp.company}</div>
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="text-sm text-slate-600 leading-relaxed">{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Education
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-slate-800">{edu.school}</h4>
                  <p className="text-sm text-indigo-600 font-medium">{edu.degree}</p>
                  <p className="text-xs text-slate-500 mt-1">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
