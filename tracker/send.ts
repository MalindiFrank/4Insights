/**
 * Sends events to the collector service
 *
 * @param apiKey The API key for authentication
 * @param event The event to send
 * @returns Promise that resolves when the event is sent
 */
export async function send(
  apiKey: string,
  event: Record<string, unknown>,
): Promise<void> {
  const response = await fetch("http://localhost:8080/collect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Failed to send event: ${response.statusText}`);
  }
}
