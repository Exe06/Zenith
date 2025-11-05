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
    const payments = [];
    
    const [lpContract] = await queryInterface.sequelize.query(
      `SELECT id, start_date FROM contracts WHERE contract_type = 'largo_plazo' LIMIT 1;`, 
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [tempContract] = await queryInterface.sequelize.query(
      `SELECT id, start_date, total FROM contracts WHERE contract_type = 'temporal' LIMIT 1;`, 
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!lpContract || !tempContract) {
      console.log("Advertencia: No se encontraron contratos, saltando pagos.");
      return; 
    }

    const lpContractId = lpContract.id;
    const lpStartDate = new Date(lpContract.start_date);

    // --- 2. LÓGICA LARGO PLAZO (CUOTAS RECURRENTES) ---
    const monthlyAmount = 300000.00;
    
    // El primer pago (Pago Inicial Único)
    payments.push({
      contract_id: lpContractId,
      due_date: addMonths(lpStartDate, 0), 
      paid_date: addDays(addMonths(lpStartDate, 0), 1),
      amount: monthlyAmount, 
      method: 'transferencia',
      description: 'Pago Inicial/Depósito de Garantía',
      created_at: today,
      updated_at: today
    });

    // Cuotas Mensuales Recurrentes (300k cada mes)
    for (let m = 1; m <= 6; m++) {
      let dueDate = addMonths(lpStartDate, m); // Corregido: Usa la fecha de inicio del contrato, no 'today'
      let paidDate = null;
      let method = null;
      
      if (m <= 3) { 
        paidDate = addDays(dueDate, 2);
        method = 'mercado_pago';
      }
      
      const recurringPayment = {
        contract_id: lpContractId,
        due_date: dueDate,
        paid_date: paidDate,
        amount: monthlyAmount,
        description: `Alquiler Cuota ${m}`,
        created_at: today,
        updated_at: today
      };

      if (method) {
        recurringPayment.method = method;
      }

      payments.push(recurringPayment);
    }
    
    // --- 3. LÓGICA TEMPORAL (PAGO ÚNICO) ---
    const tempContractId = tempContract.id;
    payments.push({
      contract_id: tempContractId,
      due_date: new Date(tempContract.start_date),
      paid_date: null, // Asumimos que aún no se pagó
      amount: tempContract.total, // El monto total del contrato temporal
      description: 'Pago Único - Estadía Completa',
      created_at: today,
      updated_at: today
    });

    await queryInterface.bulkInsert('payments', payments, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', null, {});
  }
};