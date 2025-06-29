"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileSpreadsheet, Brain, Download, Upload, Sparkles, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ExcelAI Pro
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard">
              <motion.div {...scaleOnHover}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Excel Management
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight"
          >
            Transform Your Excel
            <br />
            <span className="relative">
              Experience
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-30 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Harness the power of AI to create, modify, and analyze Excel spreadsheets with unprecedented ease. Your
            data, supercharged by artificial intelligence.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <motion.div {...scaleOnHover}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg"
                >
                  <Brain className="mr-2 w-5 h-5" />
                  Start Creating
                </Button>
              </motion.div>
            </Link>
            <motion.div {...scaleOnHover}>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-xl border-2 bg-transparent"
              >
                <FileSpreadsheet className="mr-2 w-5 h-5" />
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">Powerful Features</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Everything you need to work with Excel files, enhanced by AI capabilities
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            {
              icon: Upload,
              title: "Smart Upload",
              description: "Drag and drop Excel files with intelligent parsing and validation",
              gradient: "from-green-500 to-emerald-500",
            },
            {
              icon: Brain,
              title: "AI Processing",
              description: "Let AI analyze, modify, and enhance your spreadsheet data automatically",
              gradient: "from-purple-500 to-violet-500",
            },
            {
              icon: Download,
              title: "Instant Export",
              description: "Download your processed files in multiple formats with one click",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Process large datasets in seconds with optimized performance",
              gradient: "from-yellow-500 to-orange-500",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Your data stays local and secure with client-side processing",
              gradient: "from-red-500 to-pink-500",
            },
            {
              icon: Globe,
              title: "Cross-Platform",
              description: "Works seamlessly across all devices and screen sizes",
              gradient: "from-indigo-500 to-purple-500",
            },
          ].map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
            animate={{
              background: [
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                "linear-gradient(225deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
              ],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Revolutionize Your Workflow?</h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who have transformed their Excel experience with AI
            </p>
            <Link href="/dashboard">
              <motion.div {...scaleOnHover}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg font-semibold rounded-xl"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Get Started Now
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">ExcelAI Pro</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2024 ExcelAI Pro. Transforming spreadsheets with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
