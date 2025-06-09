# FN Forecast

A Next.js application for analyzing and forecasting Fortnite Creative map analytics.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/virocodes/fn-forecast.git
   cd fn-forecast
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   - Create `.env.local`
   - Fill in required environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_API_URL`

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

6. Complete the steps in the other repo


## Approach

I built a basic Next.js app with Supabase that allows you sign in with Google OAuth or a magic link, has an account page where you can view and set your name/bio, and a main dashboard page where you can input a map code and get shown a graph and table of its last month of peak user data, and a get forecast button, which will then predict the next 30 days and add them to the chart and table. I built a separate FastAPI application that has the 

## Data Collection + Forecasting Technique

The main struggle with scraping fortnite.gg is that you have the click the "1M" button to get the last months data dynamically rendered, so I couldn't just get the raw html of the page, I had to mock clicking the button and waiting for the new content to render. I was originally using Playwright, but it didn't work, as I think fortnite.gg had defenses against scraping and didn't render the new content when the button was clicked, so I switched to ScrapingBee which allowed me to click the button, render the new content, then scrape that from the table. 

For forecasting, I use a combination of linear regression and weekly seasonality patterns. The algorithm calculates the overall trend using linear regression on the historical data, then applies day-of-week seasonality factors derived from past patterns. To make predictions feel more natural, I add controlled random variations (up to 15%) to the forecasted values while maintaining the underlying trend and seasonal patterns.
