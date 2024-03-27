import axios from 'axios'

export default async function handler(req: any, res: any) {
  // This API route expects a POST request with the image as a file or base64 string in the body.
  if (req.method === 'POST') {
    // Extract the image from the request body
    const image = req.body.image // Assuming image is passed as base64 string
    const askedText =
      'Create for me metadata for this image in json format. JSON must include fields:\n' +
      '\n' +
      'name: appropriate image name,\n' +
      'description: appropriate description of image,\n' +
      'attributes: an array of type - trait_type: name of attribute, value: value of attribute ie (trait_type: hair, value: red)'

    // OpenAI API Key
    const api_key = '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'

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api_key}`,
    }

    const payload = {
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: askedText,
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',

        payload,

        {
          headers,
        }
      )

      res.status(200).json(response.data)
    } catch (error) {
      res.status(500).json({ error: 'Error processing your request' + error })
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
