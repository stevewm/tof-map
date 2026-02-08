"use server"

import fs from 'fs/promises';
import path from 'path';
import jsyaml from 'js-yaml';

export async function loadYamlData<T>(filename: string): Promise<T[]> {
  try {
    const filePath = path.join(process.cwd(), filename);
    const fileContents = await fs.readFile(filePath, 'utf-8');

    return jsyaml.load(fileContents) as T[];
  } catch (error) {
      console.error(`Error loading ${filename}:`, error);
    return [];
  }
}