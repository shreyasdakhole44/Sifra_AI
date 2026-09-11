export function getRiskColor(levelOrScore: string | number) {
  let color: 'red' | 'orange' | 'green' = 'green';
  
  if (typeof levelOrScore === 'string') {
    const l = levelOrScore.toUpperCase();
    if (l === 'HIGH' || l === 'CRITICAL') color = 'red';
    else if (l === 'MEDIUM' || l === 'MODERATE') color = 'orange';
    else color = 'green';
  } else {
    if (levelOrScore >= 70) color = 'red';
    else if (levelOrScore >= 40) color = 'orange';
    else color = 'green';
  }

  return {
    color,
    hex: color === 'red' ? '#E11D48' : color === 'orange' ? '#F59E0B' : '#16A34A',
    bg: color === 'red' ? 'bg-rose-600' : color === 'orange' ? 'bg-amber-500' : 'bg-emerald-600',
    text: color === 'red' ? 'text-rose-600' : color === 'orange' ? 'text-amber-500' : 'text-emerald-600',
    badge: color === 'red' ? 'bg-rose-50 text-rose-700 border border-rose-200' : color === 'orange' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  };
}

export const RISK_HEX = {
  red: '#E11D48',
  orange: '#F59E0B',
  green: '#16A34A',
};

export const RISK_LABEL = {
  red: 'High Risk (>70%)',
  orange: 'Needs Attention (40-70%)',
  green: 'Compliant (<40%)',
};
