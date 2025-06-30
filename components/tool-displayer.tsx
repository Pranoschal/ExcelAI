"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileText, Database, BarChart3, Download, Calculator, Brain, Sparkles, Bot, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const tools = [
  { name: "read_file", description: "Read an entire CSV or Excel file", category: "File Operations" },
  { name: "get_cell", description: "Get the value of a specific cell using A1 notation", category: "Data Access" },
  { name: "get_range", description: "Get values from a range of cells", category: "Data Access" },
  { name: "get_headers", description: "Get the column headers (first row) of a file", category: "Data Access" },
  { name: "search", description: "Search for cells containing a specific value", category: "Data Analysis" },
  { name: "filter_rows", description: "Filter rows based on column values", category: "Data Analysis" },
  { name: "aggregate", description: "Perform aggregation operations on a column", category: "Data Analysis" },
  {
    name: "statistical_analysis",
    description: "Perform comprehensive statistical analysis on a column",
    category: "Data Analysis",
  },
  {
    name: "correlation_analysis",
    description: "Calculate correlation between two numeric columns",
    category: "Data Analysis",
  },
  {
    name: "data_profile",
    description: "Generate comprehensive data profiling report for all columns",
    category: "Data Analysis",
  },
  { name: "pivot_table", description: "Create pivot table with grouping and aggregation", category: "Data Analysis" },
  {
    name: "write_file",
    description: "Write data to a new CSV or Excel file (supports multiple sheets for Excel)",
    category: "File Operations",
  },
  { name: "add_sheet", description: "Add a new sheet to an existing Excel file", category: "File Operations" },
  {
    name: "write_multi_sheet",
    description: "Create a complex Excel file with multiple sheets, formulas, and inter-sheet references",
    category: "File Operations",
  },
  {
    name: "export_analysis",
    description: "Export analysis results (pivot tables, statistics, etc.) to a new file",
    category: "Export",
  },
  {
    name: "evaluate_formula",
    description: "Evaluate an Excel formula with given context",
    category: "Formula Operations",
  },
  {
    name: "parse_natural_language",
    description: "Convert natural language to Excel formula or command",
    category: "AI Features",
  },
  {
    name: "explain_formula",
    description: "Explain what an Excel formula does in plain English",
    category: "Formula Operations",
  },
  { name: "ai_provider_status", description: "Check status of available AI providers", category: "AI Features" },
  {
    name: "smart_data_analysis",
    description: "AI-powered analysis suggestions for your data",
    category: "AI Features",
  },
]

const categoryIcons = {
  "File Operations": FileText,
  "Data Access": Database,
  "Data Analysis": BarChart3,
  Export: Download,
  "Formula Operations": Calculator,
  "AI Features": Brain,
}

const categoryColors = {
  "File Operations": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Data Access": "bg-green-500/20 text-green-300 border-green-500/30",
  "Data Analysis": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Export: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Formula Operations": "bg-red-500/20 text-red-300 border-red-500/30",
  "AI Features": "bg-pink-500/20 text-pink-300 border-pink-500/30",
}

export default function ToolsShowcase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(tools.map((tool) => tool.category)))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5 text-blue-400" />
          </motion.div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Available Excel Tools</h3>
        </div>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          Here are all the tools I can use to help you with Excel and data analysis:
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 px-2">
          <Button
            variant={selectedCategory === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={`h-7 sm:h-8 text-xs px-2 sm:px-3 transition-all duration-200 ${
              selectedCategory === null
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
            }`}
          >
            <span className="hidden xs:inline">All</span>
            <span className="xs:hidden">All</span>
            <span className="ml-1 text-xs opacity-75">({tools.length})</span>
          </Button>
          {categories.map((category) => {
            const categoryCount = tools.filter((tool) => tool.category === category).length
            const isSelected = selectedCategory === category
            return (
              <Button
                key={category}
                variant={isSelected ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(isSelected ? null : category)}
                className={`h-7 sm:h-8 text-xs px-2 sm:px-3 transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                }`}
              >
                <span className="hidden sm:inline truncate max-w-24">{category}</span>
                <span className="sm:hidden truncate max-w-16">{category.split(" ")[0]}</span>
                <span className="ml-1 text-xs opacity-75 flex-shrink-0">({categoryCount})</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-h-80 sm:max-h-96 overflow-y-auto overflow-x-hidden scrollbar-none px-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchTerm}-${selectedCategory}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          >
          {filteredTools.map((tool) => {
            const IconComponent = categoryIcons[tool.category as keyof typeof categoryIcons]
            return (
              <motion.div key={tool.name} variants={itemVariants} className="group h-full">
                <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-200 hover:bg-gray-800/70 h-full flex flex-col">
                  <CardHeader className="pb-2 sm:pb-3 flex-shrink-0 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                      <div className="p-1 sm:p-1.5 rounded-md bg-gray-700/50 flex-shrink-0">
                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0 ${categoryColors[tool.category as keyof typeof categoryColors]}`}
                      >
                        <span className="truncate max-w-20 sm:max-w-none">{tool.category}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-xs sm:text-sm font-medium text-white leading-tight break-words">
                      {tool.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex-grow flex items-start p-3 sm:p-4 pt-0">
                    <CardDescription className="text-xs text-gray-400 leading-relaxed break-words">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* No Results State */}
      {filteredTools.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg text-gray-400 mb-2">No tools found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Stats Footer */}
      <div className="text-center pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800/50 rounded-full border border-gray-700">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">
              {filteredTools.length} of {tools.length} tools
            </span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-gray-600" />
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{categories.length} categories</span>
          </div>
        </div>
      </div>
    </div>
  )
}