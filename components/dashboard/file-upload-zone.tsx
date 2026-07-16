"use client";

import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { UploadedFile } from "@/types/uploaded-file";

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 },
};

interface FileUploadZoneProps {
  files: File[];
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  isDragActive: boolean;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
}

export function FileUploadZone({
  files,
  uploadedFiles,
  isUploading,
  isDragActive,
  getRootProps,
  getInputProps,
}: FileUploadZoneProps) {
  const rootProps = getRootProps();

  return (
    <motion.div variants={slideIn} initial="initial" animate="animate">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Excel Files
          </CardTitle>
          <CardDescription>
            Drag and drop your Excel files or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            onClick={rootProps.onClick}
            onKeyDown={rootProps.onKeyDown}
            onFocus={rootProps.onFocus}
            onBlur={rootProps.onBlur}
            onDrop={rootProps.onDrop}
            onDragOver={rootProps.onDragOver}
            onDragEnter={rootProps.onDragEnter}
            onDragLeave={rootProps.onDragLeave}
            tabIndex={rootProps.tabIndex}
            role={rootProps.role}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-slate-300 dark:border-slate-700 hover:border-blue-400"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ y: isDragActive ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Drop the files here...
                </p>
              ) : (
                <div>
                  <p className="text-slate-600 dark:text-slate-300 mb-2">
                    Drag & drop Excel files here, or click to select
                  </p>
                  <p className="text-sm text-slate-500">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {(files.length > 0 || uploadedFiles.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2"
              >
                <Label className="text-sm font-medium">Uploaded Files:</Label>
                {isUploading && (
                  <p className="text-xs text-slate-500">Uploading to server…</p>
                )}
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={file.filename || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm truncate">{file.originalName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </motion.div>
                ))}
                {files.length > uploadedFiles.length &&
                  files.slice(uploadedFiles.length).map((file, index) => (
                    <motion.div
                      key={`pending-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg opacity-70"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm truncate">{file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        uploading…
                      </Badge>
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
