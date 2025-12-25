import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';

interface OrderCountdownProps {
  createdAt: string; // ISO string
}

const formatTime = (msRemaining: number) => {
  if (msRemaining <= 0) return '00:00';
  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const OrderCountdown: React.FC<OrderCountdownProps> = ({ createdAt }) => {
  const deadline = useMemo(() => {
    const base = new Date(createdAt).getTime();
    // 30 minutes = 30 * 60 * 1000 ms
    return base + 30 * 60 * 1000;
  }, [createdAt]);

  const calcRemaining = () => Math.max(0, deadline - Date.now());

  const [remaining, setRemaining] = useState<number>(calcRemaining());

  useEffect(() => {
    setRemaining(calcRemaining());
    const timer = setInterval(() => {
      setRemaining(calcRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const isExpired = remaining <= 0;
  const display = isExpired ? '订单已超时' : formatTime(remaining);

  return (
    <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
      <Clock size={16} className="flex-shrink-0" />
      <span className="flex-shrink-0">支付剩余时间:</span>
      <span>{display}</span>
    </div>
  );
};

export default OrderCountdown;
