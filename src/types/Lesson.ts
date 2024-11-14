export interface Lesson {
    id: string;
    name: string;
    learningOutcomes: string[];
    content: string;
    description: string;
    recommendTime: string;
    progress: number;
    recommendContent: string;
    explain: string;
    modules: Module[];
  }
export interface Module {
    id: string;
    introduction: string;
    objectives: string[];
}