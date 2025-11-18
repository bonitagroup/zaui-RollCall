import { useEffect, useState } from 'react';
import { Text } from 'zmp-ui';

function DateDisplay() {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
      const dayOfWeek = weekdays[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();

      setDateStr(`${dayOfWeek}, ${day}/${month}/${year}`);
    };

    updateDate();
    const intervalId = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return <Text className="font-mono text-base text-white font-semibold">{dateStr}</Text>;
}

export default DateDisplay;
