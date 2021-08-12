import chalk from "chalk"
export function logLogo(): void {
  console.log(chalk.hex('#6990ff')(`
           ______        ______  ______  
          (____  \\      (_____ \\(_____ \\ 
           ____)  )_____ _____) )_____) )
          |  __  (| ___ |  __  /|  ____/ 
          | |__)  ) ____| |  \\ \\| |      
          |______/|_____)_|   |_|_|      
                                 
  `))
}
