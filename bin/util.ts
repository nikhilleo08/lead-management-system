import { copyFileSync, existsSync, mkdirSync } from "fs";
import { basename, join } from "path";

export function copyFilesToDestination(filePaths: string[], destinationFolder: string): void {
    // Create the destination folder if it doesn't exist
    if (!existsSync(destinationFolder)) {
      mkdirSync(destinationFolder, { recursive: true });
    }
  
    filePaths.forEach(filePath => {
      const fileName = basename(filePath);
      const destinationPath = join(destinationFolder, fileName);
  
      try {
        copyFileSync(filePath, destinationPath);
        console.log(`Successfully copied ${fileName} to ${destinationFolder}`);
      } catch (error) {
        console.error(`Error copying ${fileName}: ${error}`);
      }
    });
  }