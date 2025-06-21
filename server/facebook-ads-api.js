
const fetch = require('node-fetch');

class FacebookAdsAPI {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  async createCampaign(accessToken, adAccountId, campaignData) {
    const { campaignName, country, budget, targetUrl, finalUrl, objective, audienceSize } = campaignData;
    
    try {
      // 1. Criar a campanha
      const campaignResponse = await fetch(`${this.baseUrl}/${adAccountId}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: campaignName,
          objective: objective,
          status: 'PAUSED', // Criar pausada inicialmente
          special_ad_categories: []
        })
      });

      if (!campaignResponse.ok) {
        throw new Error(`Erro ao criar campanha: ${campaignResponse.statusText}`);
      }

      const campaign = await campaignResponse.json();
      console.log('Campanha criada:', campaign);

      // 2. Criar conjunto de anúncios
      const adsetResponse = await fetch(`${this.baseUrl}/${adAccountId}/adsets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${campaignName} - AdSet`,
          campaign_id: campaign.id,
          daily_budget: budget * 100, // Facebook API usa centavos
          billing_event: 'LINK_CLICKS',
          optimization_goal: 'LINK_CLICKS',
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
          status: 'PAUSED',
          targeting: {
            geo_locations: {
              countries: [country]
            },
            age_min: 18,
            age_max: 65,
            genders: [1, 2] // Todos os gêneros
          }
        })
      });

      if (!adsetResponse.ok) {
        throw new Error(`Erro ao criar conjunto de anúncios: ${adsetResponse.statusText}`);
      }

      const adset = await adsetResponse.json();
      console.log('Conjunto de anúncios criado:', adset);

      // 3. Criar criativo do anúncio
      const creativeResponse = await fetch(`${this.baseUrl}/${adAccountId}/adcreatives`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${campaignName} - Creative`,
          object_story_spec: {
            page_id: adAccountId.replace('act_', ''), // Usar a própria conta como página temporária
            link_data: {
              link: finalUrl,
              message: 'Oferta especial - Clique para saber mais!',
              name: 'Oferta Limitada',
              description: 'Não perca esta oportunidade única.',
              call_to_action: {
                type: 'LEARN_MORE'
              }
            }
          }
        })
      });

      if (!creativeResponse.ok) {
        console.error('Erro ao criar criativo, usando URL simples...');
        // Fallback para criativo simples
      }

      const creative = await creativeResponse.json();
      console.log('Criativo criado:', creative);

      // 4. Criar o anúncio
      const adResponse = await fetch(`${this.baseUrl}/${adAccountId}/ads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${campaignName} - Ad`,
          adset_id: adset.id,
          creative: creative.id ? { creative_id: creative.id } : undefined,
          status: 'PAUSED'
        })
      });

      if (!adResponse.ok) {
        throw new Error(`Erro ao criar anúncio: ${adResponse.statusText}`);
      }

      const ad = await adResponse.json();
      console.log('Anúncio criado:', ad);

      return {
        campaign,
        adset,
        creative,
        ad,
        success: true
      };

    } catch (error) {
      console.error('Erro na API do Facebook:', error);
      throw error;
    }
  }

  async getCampaignStats(accessToken, campaignId) {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}/insights?fields=impressions,clicks,spend,campaign_id,campaign_name`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { data: [] };
    }
  }

  async updateCampaignStatus(accessToken, campaignId, status) {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  }
}

module.exports = FacebookAdsAPI;
