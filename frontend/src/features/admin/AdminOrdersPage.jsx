import './AdminOrdersPage.css';
    // 화면 확인용 예시 데이터
    const exampleOrders = [
    {
        id: 101,
        userId: 1,
        totalAmount: 39000,
        status: 'RECEIVED',
        createdAt: '2026-11-10',
    },
    {
        id: 102,
        userId: 2,
        totalAmount: 18000,
        status: 'PROCESSING',
        createdAt: '2026-11-11',
    },
    {
        id: 103,
        userId: 3,
        totalAmount: 42000,
        status: 'COMPLETED',
        createdAt: '2026-11-12',
    },
    ];

    // 주문 상태 체크
    function getStatusText(status) {
    if (status === 'RECEIVED') {
        return '접수';
    }

    if (status === 'PROCESSING') {
        return '처리 중';
    }

    if (status === 'COMPLETED') {
        return '완료';
    }

    return '상태 확인 필요';
    }

    export default function AdminOrdersPage() {
    return (
        <section className="admin-orders">
        <div className="admin-orders__heading">
            <div>
            <p className="admin-orders__label">ORDER MANAGEMENT</p>
            <h2>주문 관리</h2>
            <p>접수된 주문과 진행 상태를 확인합니다.</p>
            </div>
        </div>

        <p className="admin-orders__notice">
            현재 예시 데이터입니다. 실제 주문 내역과 연결되지 않았습니다.
        </p>

        <div className="admin-orders__table-wrap">
            <table className="admin-orders__table">
            <thead>
                <tr>
                <th scope="col">주문 번호</th>
                <th scope="col">주문자 번호</th>
                <th scope="col">주문일</th>
                <th scope="col">주문 금액</th>
                <th scope="col">주문 상태</th>
                <th scope="col">상세</th>
                </tr>
            </thead>

            <tbody>
                {exampleOrders.map((order) => (
                <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.userId}</td>
                    <td>{order.createdAt}</td>
                    <td>{order.totalAmount.toLocaleString()}원</td>
                    <td>{getStatusText(order.status)}</td>
                    <td>
                    <button type="button" disabled>
                        상세 보기
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </section>
    );
}