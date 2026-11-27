import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests', workers:1, retries:0, timeout:30000,
 use:{baseURL:'http://127.0.0.1:4173', browserName:'chromium', headless:true},
 webServer:{command:'npm run preview -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:30000,stdout:'pipe',stderr:'pipe'},
 reporter:[['list'],['json',{outputFile:'test-results/results.json'}]],
});
