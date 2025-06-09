"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Search, Settings, Trash2, Sparkles } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const hoverEffect = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

const tapEffect = {
  scale: 0.98
};

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // Store as ISO string for serialization
  updatedAt?: string;
}

export default function Notebook() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage', error);
    }
    setIsMounted(true);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save notes to localStorage', error);
      }
    }
  }, [notes, isMounted]);

  // Memoize filtered notes for better performance
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    
    if (!trimmedTitle || !trimmedContent) return;

    const now = new Date().toISOString();

    if (isEditing && currentNoteId) {
      setNotes(notes.map(note => 
        note.id === currentNoteId 
          ? { 
              ...note, 
              title: trimmedTitle, 
              content: trimmedContent, 
              updatedAt: now 
            } 
          : note
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: trimmedTitle,
        content: trimmedContent,
        createdAt: now,
      };
      setNotes([newNote, ...notes]);
    }

    setTitle("");
    setContent("");
    setIsEditing(false);
    setCurrentNoteId(null);
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
    setCurrentNoteId(note.id);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (currentNoteId === id) {
      setTitle("");
      setContent("");
      setIsEditing(false);
      setCurrentNoteId(null);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 transition-colors duration-300">
      <header className="max-w-6xl mx-auto mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg"
            >
              <BookOpen className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Notebook
            </h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="Settings"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={container}
          className="lg:col-span-1 space-y-6"
        >
          <motion.div 
            variants={item}
            className="relative group"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              id="search-notes"
              type="search"
              placeholder="Search notes..."
              aria-label="Search notes"
              className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all duration-300 hover:shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <Button 
              className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
              onClick={() => {
                setIsEditing(false);
                setCurrentNoteId(null);
                setTitle("");
                setContent("");
                // Focus on title input after clearing
                setTimeout(() => document.getElementById('note-title')?.focus(), 0);
              }}
              aria-label="Create new note"
            >
              <span className="relative z-10 flex items-center">
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> 
                {isEditing ? 'Cancel' : 'New Note'}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </motion.div>

          <motion.div 
            variants={container}
            className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2"
          >
            <AnimatePresence mode="wait">
              {filteredNotes.length === 0 ? (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-900/50"
                >
                  <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notes yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Create your first note to get started!</p>
                </motion.div>
              ) : (
                filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    whileHover={hoverEffect}
                    whileTap={tapEffect}
                  >
                    <Card 
                      className={`cursor-pointer bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden ${
                        currentNoteId === note.id 
                          ? 'ring-2 ring-indigo-500 dark:ring-indigo-500/70 shadow-lg' 
                          : 'hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50'
                      }`}
                      onClick={() => handleEdit(note)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base font-medium line-clamp-1 text-gray-900 dark:text-white">
                            {note.title || 'Untitled Note'}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:bg-red-500/10 rounded-full transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(note.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                          {note.content}
                        </CardDescription>
                        <p className="text-xs text-gray-400 mt-2 flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5"></span>
                          {new Date(note.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-900/50">
                <CardTitle>
                  <Input
                    placeholder="Note Title"
                    className="text-2xl font-bold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Start writing your note here..."
                    className="min-h-[500px] text-base resize-none border-none shadow-none focus-visible:ring-0 p-6 placeholder-gray-400 dark:placeholder-gray-600 bg-transparent"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,transparent_95%,hsl(var(--background))_100%)] dark:bg-[linear-gradient(180deg,transparent_95%,hsl(var(--background))_100%)]"></div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    disabled={!title.trim() || !content.trim()}
                    className={`relative overflow-hidden ${!title.trim() || !content.trim() 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20'}`}
                  >
                    <span className="relative z-10 flex items-center">
                      {isEditing ? 'Update Note' : 'Save Note'}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
