import axios from 'axios';

export async function sendToDify(requestData: any) {
  const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY;
  const url = process.env.NEXT_PUBLIC_DIFY_API_URL;

  console.log('API Key exists:', !!apiKey);
  console.log('URL exists:', !!url);
  
  if (!apiKey || !url) {
    console.error('Missing configuration');
    throw new Error('Dify API key or URL is not configured');
  }

  // リクエストデータの構造を修正
  const formattedRequest = {
    query: requestData.inputs.title + " " + requestData.inputs.detail,
    user: "user123", // ユニークなユーザーID
    response_mode: "blocking",
    conversation_id: requestData.inputs?.conversation_id || undefined,
    inputs: {
      title: requestData.inputs.title,
      detail: requestData.inputs.detail,
      goal: requestData.inputs.goal,
      action: requestData.inputs.action,
      address: requestData.inputs.address,
      age: String(requestData.inputs.age), // 数値を文字列に変換
      gender: requestData.inputs.gender
    }
  };

  try {
    console.log('Sending request to Dify:', formattedRequest);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dify API Response:', data);
    
    // outputsの中身だけを確認するログを追加
    console.log('Outputs content:', data.data?.outputs);
    console.log('goal_llm:', data.data?.outputs?.goal_llm);
    console.log('action_llm:', data.data?.outputs?.action_llm);
    
    const result = {
      goal: data.data?.outputs?.goal_llm || '',
      action: data.data?.outputs?.action_llm || ''
    };
    
    console.log('Extracted goal:', result.goal);
    console.log('Extracted action:', result.action);
    
    return result;

  } catch (error) {
    console.error('Dify API Error:', error);
    throw error;
  }
}
