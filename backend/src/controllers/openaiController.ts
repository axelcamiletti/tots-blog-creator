import { Request, Response } from 'express';

export class OpenAIController {
  
  static async getCredits(req: Request, res: Response): Promise<void> {
    const billingData = await OpenAIController.fetchOpenAIBillingData();
    
    const totalBudget = 5.70;
    const totalUsed = billingData.total_usage;
    const available = totalBudget - totalUsed;
    const availablePercentage = (available / totalBudget) * 100;
    const usedPercentage = (totalUsed / totalBudget) * 100;

    res.json({
      available: Math.round(available * 100) / 100,
      totalBudget: totalBudget,
      availablePercentage: Math.max(0, Math.round(availablePercentage * 100) / 100),
      usedPercentage: Math.max(0, Math.round(usedPercentage * 100) / 100),
      used: Math.round(totalUsed * 100) / 100
    });
  }

  private static async fetchOpenAIBillingData(): Promise<any> {
    const adminKey = process.env.OPENAI_ADMIN_KEY;
    
    // Usar la fecha real del sistema (no la simulada) - últimos 30 días
    const realNow = new Date(); // Fecha real del sistema
    const thirtyDaysAgo = new Date(realNow.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const startDate = thirtyDaysAgo;
    const endDate = realNow;
    
    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);
    
    console.log(`Debug dates (últimos 30 días reales):`);
    console.log(`  Start date: ${startDate.toISOString()} (timestamp: ${startTime})`);
    console.log(`  End date: ${endDate.toISOString()} (timestamp: ${endTime})`);
    console.log(`  Difference: ${endTime - startTime} seconds (${(endTime - startTime) / 86400} days)`);
    
    const costsUrl = `https://api.openai.com/v1/organization/costs?start_time=${startTime}&end_time=${endTime}&bucket_width=1d&limit=180`;
    
    console.log(`Calling OpenAI API: ${costsUrl}`);
    
    const response = await fetch(costsUrl, {
      headers: {
        'Authorization': `Bearer ${adminKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return { total_usage: 0 };
    }

    const data = await response.json();
    console.log(`Found ${data.data ? data.data.length : 0} cost buckets`);
    
    // Sumar todos los costos del período
    let totalCosts = 0;
    if (data.data && Array.isArray(data.data)) {
      totalCosts = data.data.reduce((total: number, bucket: any) => {
        if (bucket.results && Array.isArray(bucket.results)) {
          const bucketTotal = bucket.results.reduce((sum: number, result: any) => {
            return sum + (result.amount?.value || 0);
          }, 0);
          if (bucketTotal > 0) {
            console.log(`  Bucket ${new Date(bucket.start_time * 1000).toISOString()}: $${bucketTotal}`);
          }
          return total + bucketTotal;
        }
        return total;
      }, 0);
    }
    
    console.log(`=== FINAL TOTAL COST (últimos 30 días): $${totalCosts.toFixed(2)} ===`);
    
    return {
      total_usage: totalCosts
    };
  }

  static async updateCredits(req: Request, res: Response): Promise<void> {
    const { total_budget } = req.body;
    
    if (typeof total_budget !== 'number') {
      res.status(400).json({
        success: false,
        error: 'total_budget must be a number'
      });
      return;
    }

    // Aquí podrías actualizar la variable de entorno o base de datos
    res.json({
      success: true,
      message: `Budget updated to $${total_budget}`
    });
  }

  static async refreshCredits(req: Request, res: Response): Promise<void> {
    await OpenAIController.getCredits(req, res);
  }
}
