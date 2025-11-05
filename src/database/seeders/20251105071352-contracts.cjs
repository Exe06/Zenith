'use strict';

const addMonths = (date, months) => {
  const d = new Date(date);
  const originalDate = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== originalDate) {
    d.setDate(0); 
  }
  return d;
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const today = new Date();

    // Contrato 1: LARGO PLAZO (12 meses, iniciado hace 6 meses)
    // Fechas que garantizan PAGOS ATRASADOS
    const lpStartDate = addMonths(today, -6);
    const lpEndDate = addMonths(lpStartDate, 12);

    // Contrato 2: TEMPORAL (30 días, iniciado hace 1 mes)
    const tempStartDate = addMonths(today, -1);
    const tempEndDate = addDays(tempStartDate, 30); // Asumo helper addDays existe

    await queryInterface.bulkInsert('contracts', [
      {
        property_id: 1, 
        owner_id: 2, 
        tenant_id: 3, 
        guarantee_id: null,
        contract_type: 'largo_plazo',
        start_date: lpStartDate,
        end_date: lpEndDate,
        pay_frequency: 'mensual',
        
        // Pagos/Cuota (300k mensuales + 300k inicial)
        monto_base: 300000.00, // Pago Inicial Único
        deposito: 300000.00, // Cuota Mensual Recurrente
        daily_price: null,
        
        // Indexación fija (como definimos)
        adjustment_index: 'ICL',
        adjustment_period_months: 12,

        total: 3900000.00, // (300k Inicial + 300k * 12 meses)
        interest_rate: 0.50, // Tasa de mora
        estado: 'activo',
        created_at: today,
        updated_at: today
      },
      {
        property_id: 2,
        owner_id: 2, 
        tenant_id: 3, 
        guarantee_id: null,
        contract_type: 'temporal',
        start_date: tempStartDate,
        end_date: tempEndDate,
        pay_frequency: 'un_pago',
        daily_price: 15000.00,
        monto_base: null,
        deposito: null,
        total: 450000.00, // (15000 * 30 días)
        interest_rate: null,
        estado: 'finalizado',
        created_at: today,
        updated_at: today
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('contracts', null, {});
  }
};
