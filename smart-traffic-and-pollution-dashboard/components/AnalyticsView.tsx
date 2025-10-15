import React, { useState } from 'react';
import HistoricalChart from './HistoricalChart';
import HarmfulGases from './HarmfulGases';
import { LightbulbIcon } from './icons';
import { getAIAnalysis } from '../services/geminiService';
import type { HistoricalDataPoint, GasData, TrafficAlertData } from '../types';

interface AnalyticsViewProps {
  historicalData: HistoricalDataPoint[];
  gasData: GasData[];
  aiAnalysis: string;
  onAnalysisUpdate: (analysis: string) => void;
  trafficAlert: TrafficAlertData | null;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ historicalData, gasData, aiAnalysis, onAnalysisUpdate, trafficAlert }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    try {
      const prompt = `
        Analyze the following urban data and provide actionable insights for a city manager.
        Focus on correlations between traffic, air quality, and parking availability.
        ${trafficAlert ? `CRITICAL TRAFFIC ALERT: There is a ${trafficAlert.type} at ${trafficAlert.location}. Take this into immediate consideration.` : ''}
        Keep the analysis concise, under 150 words.

        - Historical Data (last 24 hours): ${JSON.stringify(historicalData.slice(-6))}
        - Current Harmful Gas Levels: ${JSON.stringify(gasData)}
      `;
      const analysis = await getAIAnalysis(prompt);
      onAnalysisUpdate(analysis);
    } catch (error) {
      console.error("Failed to get AI analysis:", error);
      onAnalysisUpdate("An error occurred while generating insights. Please check the console and ensure your API key is configured correctly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">24-Hour Trends</h3>
          <HistoricalChart data={historicalData} />
        </div>
        <HarmfulGases data={gasData} />
      </div>
      <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <LightbulbIcon className="w-7 h-7 text-yellow-300" />
            <h3 className="text-xl font-bold text-white">AI-Powered Insights</h3>
          </div>
          <button
            onClick={handleGenerateInsights}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg min-h-[100px] text-gray-300">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{aiAnalysis}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
