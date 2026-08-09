import { AppDataSource } from './data-source';

async function runSeeders(): Promise<void> {
  await AppDataSource.initialize();

  console.info('Database connected. Running seeders...\n');
//aca van los seeders
  await AppDataSource.destroy();
  console.log('\nAll seeders completed successfully.');
}

runSeeders().catch((error) => {
  console.error('Seeding failed: ', error);
  process.exit(1);
});