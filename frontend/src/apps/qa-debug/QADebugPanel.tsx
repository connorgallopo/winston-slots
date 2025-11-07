// frontend/src/apps/qa-debug/QADebugPanel.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QADebugger, type QATestResult } from '../../utils/qaDebug';
import { Card, CardBody, Button } from '../../components';

export function QADebugPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<QATestResult[]>([]);
  const [debugger] = useState(() => new QADebugger());

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      const testResults = await debugger.runAutomatedTests(20);
      setResults(testResults);
    } catch (error) {
      console.error('QA tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const summary = results.length > 0 ? debugger.getSummary() : null;

  return (
    <div className="min-h-screen p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-500 mb-4">
            QA Debug Mode
          </h1>
          <p className="text-2xl text-gray-400">
            Automated spin testing and validation
          </p>
        </div>

        <Card>
          <CardBody className="p-8">
            <div className="flex gap-4 items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Automated Test Suite
                </h2>
                <p className="text-gray-400">
                  Runs 20 spins and validates timing, alignment, and FPS
                </p>
              </div>
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="px-8 py-4 text-xl"
              >
                {isRunning ? 'Running...' : 'Run Tests'}
              </Button>
            </div>

            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 grid grid-cols-4 gap-4"
              >
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Tests</p>
                  <p className="text-3xl font-bold text-white">{summary.total}</p>
                </div>
                <div className="bg-green-900/30 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Passed</p>
                  <p className="text-3xl font-bold text-green-400">{summary.passed}</p>
                </div>
                <div className="bg-red-900/30 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-3xl font-bold text-red-400">{summary.failed}</p>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Pass Rate</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {summary.passRate.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            )}
          </CardBody>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Test Results</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.testNumber}
                    className={`p-4 rounded-lg ${
                      result.alignmentPass ? 'bg-green-900/20' : 'bg-red-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        Test #{result.testNumber}
                      </span>
                      <span className={result.alignmentPass ? 'text-green-400' : 'text-red-400'}>
                        {result.alignmentPass ? '✓ Pass' : '✗ Fail'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      <p>Total: ${result.total.toLocaleString()}</p>
                      <p>Duration: {result.spinDuration.toFixed(2)}ms</p>
                      {result.errors.length > 0 && (
                        <p className="text-red-400">Errors: {result.errors.join(', ')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
