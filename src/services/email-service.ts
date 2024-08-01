class EmailService {
  async send(to: string, body: string): Promise<void> {
    console.log(`Sending to ${to}:\n${body}`);
  }
}

export default EmailService;
