import { handler } from './index';

async function testHandler() {
  try {
		await handler(null, null);
    console.log('Test completed successfully.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHandler();
