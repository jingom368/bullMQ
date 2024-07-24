import axios from 'axios';

const baseURL = 'http://localhost:3000/videos'; // Adjust the base URL as needed

async function testVideoController() {
  try {
    // Test addVideoForProcessing
    await axios.post(`${baseURL}/process`, { videoId: '123' });
    console.log('addVideoForProcessing success');

    // Test addVideosForProcessing
    await axios.post(`${baseURL}/process-group`, {
      videoIds: ['123', '456'],
      groupId: 'group1',
    });
    console.log('addVideosForProcessing success');

    // Test addVideosForProcessing2
    await axios.post(`${baseURL}/addProcessGroup`, {
      videoIds: ['789', '012'],
    });
    console.log('addVideosForProcessing2 success');

    // Test checkGroupCompletion
    await axios.get(`${baseURL}/check-group-completion`, {
      params: { groupId: 'group1' },
    });
    console.log('checkGroupCompletion success');

    // Test getJobAll
    await axios.get(`${baseURL}/waiting-all`);
    console.log('getJobAll success');

    // Test getJobChildren
    await axios.get(`${baseURL}/waiting-children`);
    console.log('getJobChildren success');

    // Test setRedisServer
    await axios.get(`${baseURL}/setRedis`, {
      params: { key: 'testKey', value: 'testValue' },
    });
    console.log('setRedisServer success');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

testVideoController();
