declare module 'mailhog' {
    interface MailHogOptions {
      host?: string;
      port?: number;
      protocol?: string;
      basePath?: string;
    }

    interface Attachment {
        name: string, 
        type: string, 
        encoding: string 
        body: string
    }

    interface Mail {
        ID: string,          
        text: string,        
        html: string,        
        subject: string,     
        from: string,        
        to: string,          
        cc: string,          
        bcc: string,         
        replyTo: string,     
        date: Date,          
        deliveryDate: Date,  
        attachments: Attachment[]   
    }
  
    export interface MailHog {
      messages(start: number, limit: number): Promise<{
        total: number, 
        count: number,
        start: number, 
        items: Mail[]
      }>;
      search(kind: string, query: string): Promise<any>;
      latestTo(query: string): Promise<Mail>
      deleteAll(): Promise<any>;
    }
  
    function mailhog(options?: MailHogOptions): MailHog;
  
    export default mailhog;;
  }
  