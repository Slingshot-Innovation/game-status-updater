require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function updateGameStatuses() {
  const now = new Date();

  // Update 'scheduled' games to 'live'
  const { data: startedGames, error: startedError } = await supabase
    .from('games')
    .update({ status: 'live' })
    .eq('status', 'scheduled')
    .lte('start_time', now.toISOString())
    .gt('end_time', now.toISOString());

  if (startedError) {
    console.error('Error updating started games:', startedError);
  } else {
    if (startedGames) {
      console.log(`Updated ${startedGames.length} games to 'live' status`);
    } else {
      console.log('No games to update to live status');
    }
  }

  // Update 'live' games to 'finished'
  const { data: finishedGames, error: finishedError } = await supabase
    .from('games')
    .update({ status: 'finished' })
    .eq('status', 'live')
    .lte('end_time', now.toISOString());

  if (finishedError) {
    console.error('Error updating finished games:', finishedError);
  } else {
    if (finishedGames) {
      console.log(`Updated ${finishedGames.length} games to 'finished' status`);
    } else {
      console.log('No games to update to finished status');
    }
  }
}

// Run the update function every minute
cron.schedule('* * * * *', () => {
  console.log('Running game status update...');
  updateGameStatuses();
});

console.log('Game status update service started');