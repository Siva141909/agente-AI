import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import TransactionModal from "@/components/TransactionModal";
import VoiceModal from "@/components/VoiceModal";
import ScanModal from "@/components/ScanModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Camera, PenLine, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, transactions, dailyGoal, goalProgress, isLoading, isAuthenticated, error } = useApp();
  const navigate = useNavigate();
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/signup");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date === today);
  const todayIncome = todayTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border border-red-300 dark:border-red-700 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300 shadow-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Hi {user.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Here's your financial overview</p>
        </motion.div>

        {/* Balance Card - Premium Design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary via-primary to-secondary text-white p-8">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:blur-2xl transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full -ml-48 -mb-48 blur-3xl group-hover:blur-2xl transition-all duration-500" />

            <div className="relative z-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="text-sm font-semibold opacity-90 mb-2 uppercase tracking-wider">Total Balance</div>
                <div className="text-6xl font-black mb-6 leading-tight">₹{user.balance?.toLocaleString("en-IN") || "0"}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 text-lg font-semibold"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm opacity-90">Today's Progress</div>
                  <div className="text-2xl font-bold">+₹{(todayIncome - todayExpense).toLocaleString("en-IN")}</div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Goal & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-0 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Savings Goal</div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">₹{dailyGoal}</div>
                </div>
                <div className="text-5xl">{goalProgress >= 100 ? "🎉" : "🎯"}</div>
              </div>
              <Progress value={Math.min(goalProgress, 100)} className="h-3 mb-3" />
              <div className="text-sm font-medium text-muted-foreground">
                {goalProgress >= 100 ? "🌟 Goal achieved! Amazing work!" : `${Math.round(goalProgress)}% completed`}
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0 shadow-xl">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Today's Activity</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm text-muted-foreground">Income</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{todayIncome.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="text-sm text-muted-foreground">Expenses</span>
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{todayExpense.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions - Modern Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Mic, label: "Speak", action: () => setVoiceModalOpen(true), color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950" },
              { icon: Camera, label: "Scan", action: () => setScanModalOpen(true), color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950" },
              { icon: PenLine, label: "Enter", action: () => setTransactionModalOpen(true), color: "from-green-500 to-green-600", bgColor: "bg-green-50 dark:bg-green-950" },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={action.action}
                    className={`h-28 w-full flex-col gap-3 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${action.color} text-white font-semibold`}
                  >
                    <Icon className="w-7 h-7" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>
          {todayTransactions.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-to-br from-muted to-muted/50 border-0 shadow-lg">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-lg font-semibold text-foreground">No transactions yet</p>
              <p className="text-muted-foreground mt-2">Start by adding your first transaction!</p>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background to-muted/30">
              <div className="divide-y divide-border/50">
                {todayTransactions.slice(0, 5).map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.05 }}
                    whileHover={{ x: 8, backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="p-5 flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          transaction.type === "income"
                            ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-600 dark:text-green-400"
                            : "bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                      </motion.div>
                      <div>
                        <div className="font-semibold text-foreground">{transaction.category}</div>
                        <div className="text-sm text-muted-foreground">{transaction.time}</div>
                      </div>
                    </div>
                    <div
                      className={`font-bold text-lg ${
                        transaction.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      <TransactionModal open={transactionModalOpen} onClose={() => setTransactionModalOpen(false)} />
      <VoiceModal open={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
      <ScanModal open={scanModalOpen} onClose={() => setScanModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
